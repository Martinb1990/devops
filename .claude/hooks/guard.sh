#!/usr/bin/env bash
# Claude Code safety guard — PreToolUse hook for the Bash tool.
#
# Reads the tool-call JSON on stdin and returns a permission decision:
#   allow  -> proceed without the normal prompt   (we never use this; we stay
#             silent instead so normal permissions still apply)
#   ask    -> force a confirmation prompt to the user
#   deny   -> block the command outright
#
# Exit 0 with NO output = "no opinion", let normal permission flow continue.
set -euo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')
[ -z "$cmd" ] && exit 0

decide() { # $1 = allow|ask|deny   $2 = reason shown to user/model
  jq -nc --arg d "$1" --arg r "$2" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:$d,permissionDecisionReason:$r}}'
  exit 0
}

# ---------------------------------------------------------------------------
# 1. Guard against accidental file deletion
# ---------------------------------------------------------------------------
if printf '%s' "$cmd" | grep -Eqw 'rm'; then
  # Catastrophic targets / disabled safety -> hard block.
  if printf '%s' "$cmd" | grep -Eq -- '--no-preserve-root' \
     || printf '%s' "$cmd" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]+[[:space:]]+)*(/|/\*|~|~/|~/\*|\$HOME|\$\{HOME\})([[:space:]]|/|$)'; then
    decide deny "Blocked: 'rm' targeting a root/home path (or --no-preserve-root). If this is truly intended, run it yourself outside Claude."
  fi

  # Recursive AND force (rm -rf / rm -fr / rm -r -f) on anything else -> confirm.
  has_r=false; has_f=false
  printf '%s' "$cmd" | grep -Eq '(^|[[:space:]])-[a-zA-Z]*[rR]' && has_r=true
  printf '%s' "$cmd" | grep -Eq '(^|[[:space:]])-[a-zA-Z]*f'     && has_f=true
  if $has_r && $has_f; then
    decide ask "Recursive force-delete detected. Confirm the target before running: $cmd"
  fi
fi

# ---------------------------------------------------------------------------
# 2 & 3. Protect the main branch (commit / push / merge)
# ---------------------------------------------------------------------------
if printf '%s' "$cmd" | grep -Eq '(^|[[:space:]]|&&|;|\|)git([[:space:]]|$)'; then
  # --show-current reports the branch even on an unborn branch (no commits yet);
  # empty when detached. More robust than rev-parse for this guard.
  branch=$(git branch --show-current 2>/dev/null || echo "")

  # Committing while on main -> block; force a feature branch instead.
  if [ "$branch" = "main" ] && printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+commit'; then
    decide deny "You're on 'main'. Create a feature branch first (git checkout -b <name>) and commit there, then ask before merging to main."
  fi

  # Pushing to main (explicit refspec, or pushing while on main) -> ask first.
  if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push'; then
    if printf '%s' "$cmd" | grep -Eq '([[:space:]]|:)main([[:space:]]|$)' || [ "$branch" = "main" ]; then
      decide ask "This pushes to 'main'. Always ask the user before pushing to main."
    fi
  fi

  # Merging while on main would change main -> ask first.
  if [ "$branch" = "main" ] && printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+merge'; then
    decide ask "This merges into 'main'. Always ask the user before merging to main."
  fi
fi

exit 0

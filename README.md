# DevOps Backend Stack

Production-style backend stack using:

- Node.js (Express)
- PostgreSQL
- Redis
- Docker Compose
- Nginx Proxy Manager
- GitHub Actions (CI/CD)

---

## Services

| Service | Purpose |
|---|---|
| Node.js API | Backend API (internal only, behind the proxy) |
| PostgreSQL | Database |
| Redis | Cache |
| Nginx Proxy Manager | Reverse proxy / TLS |

The `db` and `redis` services expose health checks, and the API waits for both
to be healthy before starting. The API is **not** published to the host — it is
reachable only through the proxy on the internal Docker network.

---

## Setup

Copy the example env file and fill in real values:

```bash
cp .env.example .env
```

The API and PostgreSQL share the same `POSTGRES_*` credentials, so there is a
single source of truth. See [.env.example](.env.example) for the full list.

---

## Run Stack

```bash
docker compose up -d --build
```

Then configure a Proxy Host in Nginx Proxy Manager (admin UI on port `81`)
pointing to `api:3000`.

---

## Health Check

The API exposes `GET /health`, which verifies connectivity to both PostgreSQL
and Redis.

Through the proxy once a host is configured:

```bash
curl http://YOUR_DOMAIN/health
```

Quick check from inside the running container:

```bash
docker compose exec api wget -qO- localhost:3000/health
```

---

## Develop & Test

From the `api/` directory:

```bash
npm ci
npm run lint   # ESLint
npm test       # node:test + supertest
```

---

## Deployment (CI/CD)

Pushing to `main` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

1. **build** — installs deps, runs lint and tests, and verifies the Docker
   image builds.
2. **deploy** — only runs if `build` passes; SSHes to the server, pulls the
   latest code, and runs `docker compose up -d --build`.

---

## Future Goals

- HTTPS / automated certificates
- Monitoring & metrics
- Kubernetes

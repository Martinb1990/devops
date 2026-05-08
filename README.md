# DevOps Backend Stack

Production-style backend stack using:

- Node.js
- PostgreSQL
- Redis
- Docker Compose
- Portainer
- Nginx Proxy Manager

---

## Services

| Service | Purpose |
|---|---|
| Node.js API | Backend API |
| PostgreSQL | Database |
| Redis | Cache |
| Nginx Proxy Manager | Reverse proxy |

---

## Run Stack

```bash
docker compose up -d --build
```

---

## Health Check

```bash
http://SERVER_IP:3000/health
```

---

## Future Goals

- CI/CD
- HTTPS
- Monitoring
- Kubernetes

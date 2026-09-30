# 🎵 SoundStream — Modern Music Search & Preview (DevOps Showcase)

A production-ready, cloud-native mini-project architected to demonstrate core **DevOps fundamentals**: multi-stage Docker builds, container networking & internal DNS, reverse proxying with Nginx, container healthchecks, and development-to-production environment parity.

---

## 🏗️ Architecture Overview

The system consists of two containerized services connected through an isolated Docker bridge network, with Nginx acting as the single public entry point:

```
[ Client Browser ]
        │  (HTTP Port 80)
        ▼
┌────────────────────────────────────────────────────────┐
│  frontend (Nginx Alpine + React Static Build)          │
│                                                        │
│  ├── /           ──> Serves React SPA (try_files)      │
│  └── /api/*      ──> Reverse Proxy to Backend          │
│  └── /healthz    ──> Reverse Proxy to Backend Health   │
└───────────────────────┬────────────────────────────────┘
                        │
                        │ Internal Docker Bridge Network (`app-network`)
                        │ Service Discovery DNS: `http://backend:5000`
                        ▼
┌────────────────────────────────────────────────────────┐
│  backend (Node.js 20 Alpine + Fastify BFF)             │
│                                                        │
│  ├── GET /healthz     ──> Healthcheck probe            │
│  └── GET /api/search  ──> Proxies public iTunes API    │
└───────────────────────┬────────────────────────────────┘
                        │
                        │ HTTPS
                        ▼
             [ Apple iTunes Search API ]
```

---

## 🚀 Quick Start

### Option 1: Run with Docker Compose (Recommended Production Setup)

The entire multi-container stack can be built and launched with a single command:

```bash
# Build images and start containers in foreground
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

Once running:
- Open **`http://localhost`** in your browser.
- Only port **80** is exposed to your host machine.
- The Nginx reverse proxy automatically routes `/api/*` requests internally to the Fastify backend service on port 5000.

To inspect the stack and logs:
```bash
# View container status and health
docker compose ps

# View live aggregate logs
docker compose logs -f

# Stop and remove containers and network
docker compose down
```

---

### Option 2: Local Development (Without Docker)

You can run both services locally with hot reloading and environment parity:

#### 1. Start the Backend Service
```bash
cd backend
npm install
npm run dev
# Backend starts on http://localhost:5000
```

#### 2. Start the Frontend Application (in a separate terminal)
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:3000
```
> **Dev Environment Parity:** In local development, Vite's dev server proxies `/api/*` and `/healthz` directly to `http://localhost:5000`, matching Nginx's production reverse proxy routing.

---

## 💡 Key DevOps Teaching Concepts

This repository is purpose-built to teach foundational DevOps concepts:

### 1. Multi-Stage Docker Builds
Both `frontend/Dockerfile` and `backend/Dockerfile` use multi-stage builds:
- **`backend/Dockerfile`**:
  - **Stage 1 (`builder`)**: Uses full Node.js toolchain with `devDependencies` (`typescript`, `@types/*`) to compile TypeScript to JavaScript.
  - **Stage 2 (`runner`)**: Uses a clean `node:20-alpine` image, installs **only production dependencies** (`npm ci --omit=dev`), and copies over compiled artifacts from Stage 1.
  - **Benefit**: Keeps final image size tiny (~130MB vs 600MB+), minimizes security attack surface, and keeps development compilers out of production.
- **`frontend/Dockerfile`**:
  - **Stage 1 (`builder`)**: Compiles React + Vite + Tailwind CSS into a static `/app/dist` bundle.
  - **Stage 2 (`runner`)**: Uses ultra-lightweight `nginx:alpine` (~40MB) and drops the Node.js runtime entirely.

### 2. Least Privilege / Non-Root User
- In `backend/Dockerfile`, the runtime container switches to the built-in unprivileged `node` user (`USER node`).
- If an application vulnerability occurs, an attacker cannot gain root access inside the container or escape to the host kernel.

### 3. Container Networking & Service Discovery
- Services communicate over a custom user-defined Docker bridge network (`app-network`).
- Docker's embedded DNS engine resolves the hostname `backend` directly to the backend container's internal IP address.
- Notice in `docker-compose.yml`:
  - **Port 5000 is NOT bound to the host** (no `ports: ["5000:5000"]`).
  - Instead, `expose: ["5000"]` is used so that the backend is only reachable by other containers inside `app-network`.

### 4. Reverse Proxy Pattern & Zero-CORS Architecture
- The frontend client only ever makes relative requests to `/api/search?q=...`.
- In production, Nginx receives the request on port 80 and transparently proxies it to `http://backend:5000/api/...`.
- **Advantages**:
  - Eliminates Cross-Origin Resource Sharing (CORS) complexity in production.
  - Hides backend topology and internal ports from public exposure.
  - Centralizes SSL termination, rate limiting, and gzip compression at the ingress proxy layer.

### 5. Docker Healthchecks & Dependency Ordering
- The backend exposes a lightweight `GET /healthz` endpoint returning `{ status: "ok" }`.
- `docker-compose.yml` configures a healthcheck probe on `backend`:
  ```yaml
  healthcheck:
    test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:5000/healthz | grep -q 'ok' || exit 1"]
  ```
- The `frontend` service defines:
  ```yaml
  depends_on:
    backend:
      condition: service_healthy
  ```
  This ensures the Nginx reverse proxy container does not start accepting traffic until the backend application is fully initialized and passing healthchecks.

> 💡 **DevOps Pro-Tip (Alpine Linux Loopback Resolution):**
> In Alpine Linux BusyBox, `localhost` resolves to IPv6 (`::1`) first. If an application (like Node.js or Fastify) binds exclusively to IPv4 (`0.0.0.0`), queries to `http://localhost:5000` will fail with `Connection refused`. Specifying the explicit IPv4 loopback address `http://127.0.0.1:5000/healthz` is a DevOps best practice for deterministic Alpine healthchecks.


---

## 📡 API Reference

### 1. Healthcheck
- **Endpoint**: `GET /healthz`
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-30T14:28:06.461Z",
    "uptime": 42.12
  }
  ```

### 2. Music Search
- **Endpoint**: `GET /api/search?q=:query`
- **Example**: `GET /api/search?q=daft+punk`
- **Response**:
  ```json
  [
    {
      "id": 1097861834,
      "title": "One More Time",
      "artist": "Daft Punk",
      "album": "Discovery",
      "artworkUrl": "https://is1-ssl.mzstatic.com/.../600x600bb.jpg",
      "previewUrl": "https://audio-ssl.itunes.apple.com/.../preview.m4a"
    }
  ]
  ```

---

## 🧪 CI/CD Pipeline

A production GitHub Actions workflow is provided at `.github/workflows/ci.yml`:
1. **Lint & Compile**: Runs TypeScript checks and production builds for both services concurrently.
2. **Docker Build & Integration Test**: Builds multi-stage Docker images and tests full `docker compose up` stack initialization and `/healthz` routing.
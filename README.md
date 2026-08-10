# 🌌 TripWithUs Travel Platform

A modern, fully-responsive travel booking platform for **Buses, Trains, Flights, Cars & Hotels** — built with a clean separation of concerns:

- **`frontend/`** — Vanilla HTML / CSS / JS SPA (served by nginx in production)
- **`backend/`** — Spring Boot 3 + Java 17 REST API (JWT auth, JPA, H2 database)

---

## 🚀 Quick Start (Docker — recommended)

> Requires [Docker](https://www.docker.com/products/docker-desktop/) & Docker Compose.

```bash
# 1. Clone / navigate to the project root
cd trip

# 2. (Optional) Configure secrets
cp .env.example .env

# 3. Build & start both services
docker-compose up --build

# 4. Open the app
#    Frontend : http://localhost
#    Backend  : http://localhost:8080/api
#    H2 console: http://localhost:8080/h2-console
```

**Demo admin login:** `joo` / `joo@123`

---

## 🧑‍💻 Local Development (no Docker)

### Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
# or build & run
mvn clean package -DskipTests
java -jar target/*.jar
```

The API runs on `http://localhost:8080`.

### Frontend (static files)

The Spring Boot backend **also serves the static frontend** directly (via `StaticResourceConfig`), so you only need to run the backend. Open the app at:

```
http://localhost:8080
```

> The frontend uses the relative `/api` path, which the backend handles on the same origin (no separate web server or proxy needed). When opened via `file://`, the frontend automatically targets `http://localhost:8080/api`.

---

## 📂 Project Structure

```
trip/
├── frontend/                 # SPA (HTML/CSS/JS)
│   ├── index.html            # Login
│   ├── signup.html           # Signup
│   ├── home.html             # Landing page
│   ├── bus.html / car.html / train.html / flight.html / hotel.html
│   ├── history.html          # My Trips
│   ├── profile.html / admin.html
│   ├── css/style.css         # All styles (responsive + 3D animations)
│   ├── js/
│   │   ├── api.js            # API client (configurable base)
│   │   ├── mock-api.js       # Offline mock fallback
│   │   ├── common.js         # Navbar/footer/animations/payment
│   │   └── ...               # Per-feature page logic
│   ├── nginx.conf            # Production reverse-proxy config
│   └── Dockerfile
│
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/...     # Controllers, services, repos, models, security
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── data.sql          # Seed data
│   ├── pom.xml
│   └── Dockerfile (multi-stage)
│
├── docker-compose.yml        # Full-stack orchestration
├── .env / .env.example       # Environment configuration
└── README.md
```

---

## ⚙️ Environment Variables

All backend secrets are read from environment variables (with safe local defaults). See `.env.example`.

| Variable              | Default                                                      | Description                          |
|-----------------------|--------------------------------------------------------------|--------------------------------------|
| `BACKEND_PORT`        | `8080`                                                       | Backend server port                  |
| `JWT_SECRET`          | `TripWithUsSuperSecret...!!`                                  | JWT signing secret (min 32 chars)    |
| `JWT_EXPIRATION_MS`   | `86400000`                                                  | Token lifetime (ms)                  |
| `ADMIN_USERNAME`      | `joo`                                                        | Bootstrap admin username             |
| `ADMIN_PASSWORD`      | `joo@123`                                                    | Bootstrap admin password             |
| `DB_USERNAME`         | `sa`                                                         | DB username (H2 default)             |
| `DB_PASSWORD`         | *(empty)*                                                    | DB password                          |
| `DB_DDL_AUTO`         | `create-drop`                                                | Hibernate DDL strategy               |

---

## 🎨 Design & Animations

The UI uses a **Cosmic Aurora** theme (deep indigo + violet + magenta + gold) with:

- Cosmic **starfield / aurora particle** background (replaces the old water bubbles)
- **3D tilt & glare** cards, **flip cards**, **3D orbs**, **magnetic buttons**
- Animated stat counters, depth parallax, and scroll reveals
- Fully **responsive** (mobile / tablet / laptop) with `prefers-reduced-motion` support

---

## 🧪 Tests

```bash
cd backend
mvn test
```

---

## 🛠 Troubleshooting

- **Frontend can't reach API?** Ensure the backend is running on `:8080`, or set `window.TRIPWITHUS_API_BASE` before `api.js` loads.
- **Port 80 busy?** Change the frontend port mapping in `docker-compose.yml` (e.g. `"8081:80"`).
- **H2 console access denied on Docker?** The nginx config proxies `/h2-console/` → backend for local dev convenience.

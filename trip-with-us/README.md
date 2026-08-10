# TRIP-WITH-US 🚌🚗🚆✈️🏨

A full-stack, MakeMyTrip-style travel booking platform built with **Spring Boot (Java)** on the backend and a **fully responsive vanilla HTML/CSS/JS** frontend. Book buses, cars, trains, flights and hotels with live availability, dynamic pricing, interactive seat/room selection, reviews, refunds and personalized recommendations.

---

## ✅ The 6 required feature test cases

| # | Feature | Where it lives |
|---|---------|-----------------|
| 1 | **Live Flight Status** (mock real-time API, push-style updates, delay reasons, revised schedules, multi-flight tracking) | `FlightStatusService`, `FlightController` (`/api/flights/live/**`), `flight.html` live status card |
| 2 | **Dynamic Pricing Engine** (seasonal +20%, demand surge, price history graph, price freeze) | `PricingService`, `PricingController` (`/api/pricing/**`) |
| 3 | **Cancellation & Refund system** (auto-calculated %, partial refunds, dropdown-style reason, status tracker) | `RefundService`, `BookingService.cancelBooking`, Profile → Refunds tab |
| 4 | **Interactive Seat / Room Selection** (dynamic seat maps, premium seats, hotel room grid with images) | `SeatService`, bus/train/flight seat maps, hotel room cards |
| 5 | **Review & Rating system** (1–5 stars, photos, replies, flagging, moderation, sort by newest/highest/helpful) | `ReviewService`, `ReviewController` |
| 6 | **Personalized Recommendations** (history-based suggestions, "Why this recommendation?", helpful/irrelevant feedback loop) | `RecommendationService`, Profile → Recommended tab |

Automated acceptance tests for all 6 are in `src/test/java/com/tripwithus/FeatureAcceptanceTests.java`.

---

## 🔑 Login credentials

**Admin (hardcoded)**
- Username: `joo`
- Password: `joo@123`

**Users:** sign up from the app — no seed users are required.

---

## 🛠️ Tech stack

- Java 25, Spring Boot 3.3 (Web, Data JPA, Security, Validation)
- H2 in-memory database (swap the 3 lines in `application.properties` for MySQL/Postgres in production)
- JWT authentication (stateless)
- Vanilla HTML/CSS/JS frontend (no build step) — fully responsive down to small phones
- Maven build

---

## ▶️ How to run

### Prerequisites
- Java 25+
- Maven 3.8+ (or use the included wrapper if you add one)

### Steps
```bash
cd trip-with-us
mvn spring-boot:run
```
The app starts on **http://localhost:8080**

Open `http://localhost:8080/index.html` in your browser (or just `http://localhost:8080/`).

### H2 console (optional, for inspecting data)
`http://localhost:8080/h2-console`
JDBC URL: `jdbc:h2:mem:tripwithus`, user `sa`, blank password.

### Building a runnable jar
```bash
mvn clean package
java -jar target/trip-with-us-1.0.0.jar
```

---

## 📁 Project structure

```
trip-with-us/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com/tripwithus/
    │   │   ├── TripWithUsApplication.java
    │   │   ├── config/          # Security, CORS, global exception handling
    │   │   ├── controller/      # REST controllers (one per module)
    │   │   ├── dto/             # Request/response payloads
    │   │   ├── model/           # JPA entities
    │   │   ├── repository/      # Spring Data JPA repositories
    │   │   ├── security/        # JWT util + filter
    │   │   └── service/         # Business logic (incl. the 6 feature engines)
    │   └── resources/
    │       ├── application.properties
    │       ├── data.sql         # Seed buses/cars/trains/flights/hotels/coupons
    │       └── static/          # Frontend (HTML/CSS/JS) — served directly by Spring Boot
    │           ├── index.html (login) · signup.html
    │           ├── home.html · bus.html · car.html · train.html · flight.html · hotel.html
    │           ├── profile.html · admin.html
    │           ├── css/style.css
    │           └── js/ (api.js, common.js, bus.js, car.js, train.js, flight.js, hotel.js, profile.js, admin.js)
    └── test/java/com/tripwithus/
        ├── TripWithUsApplicationTests.java
        └── FeatureAcceptanceTests.java
```

---

## 🧭 Using the app

1. **Sign up** with your mobile number and password (or log in as Admin).
2. On the **Home page**, pick Bus / Car / Train / Flight / Hotel.
3. Enter **From / To / Date** (seed data covers routes like `Delhi → Jaipur` on `2026-07-25`, and `2026-12-24` for peak-season pricing).
4. Pick a result → select seats (bus/train/flight) or a room (hotel) → enter passenger details → apply a coupon (`WELCOME10`, `SUMMER15`, `DIWALI25`, `NEWYEAR30`) → confirm.
5. Go to **Profile** to view bookings, cancel (triggers an auto-refund), see refund status, get personalized recommendations, or raise a support ticket.
6. Log in as **Admin** to manage availability for every transport type, manage coupons, resolve support tickets, oversee bookings/refunds, and moderate flagged reviews.

---

## 📌 Notes on the mock "live" data

Since this is a self-contained demo without a paid aviation/traffic data subscription:
- **Flight status** is simulated by a `@Scheduled` job every 45 seconds plus an on-demand "Refresh" button, mimicking a real airline API.
- **Seat/room occupancy** is randomly seeded on first view of a vehicle so the seat map looks "live" without needing real bookings first.
- Swap `FlightStatusService` for a real provider (e.g. FlightAware, AviationStack) by replacing `pushRandomUpdate` with an HTTP client call — the rest of the app (controllers, DB, frontend) needs no changes.

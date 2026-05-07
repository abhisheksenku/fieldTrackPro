# 🛰️ FieldTrack Pro
### *Enterprise Workforce Attendance & Live Geospatial Monitoring*

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

**FieldTrack Pro** is a robust, full-stack monitoring solution designed for organizations managing a distributed workforce. By leveraging real-time WebSockets and high-precision geospatial validation, it ensures operational accountability for both office-based and field-based employees.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Technical Architecture](#-technical-architecture)
3. [Folder Structure](#-folder-structure)
4. [Mathematical Validation](#-mathematical-validation)
5. [Setup & Installation](#-setup--installation)
6. [API Documentation](#-api-documentation)
7. [Future Roadmap](#-future-roadmap)

---

## ✨ Core Features

### 🏢 Workforce Management
*   **Dual-Mode Tracking:**
    *   **Geo-Fenced Mode:** Strict site-specific attendance validation.
    *   **Remote Mode:** Continuous GPS "breadcrumb" capturing for field engineers.
*   **Consent Mechanism:** A privacy-first "Consent Gate" that ensures 100% legal compliance before any location data is transmitted.
*   **RBAC:** Tiered access for **Admins** (Global control), **Editors** (Audit & Corrections), and **Users** (Operational pings).

### 🛡️ Security & Integrity
*   **Forensic Audit Logging:** Every role change, zone deletion, or status update is logged with IP address and target model for total transparency.
*   **JWT & Refresh Rotation:** Secure session management using access tokens and `httpOnly` refresh cookies.
*   **Rate Limiting:** Protects endpoints from DDoS and brute-force authentication attempts.

### 📊 Visualization & Reporting
*   **Live Command Center:** Real-time map updates showing successful/failed punches and live movement trails.
*   **Stale User Alerts:** Automated detection and SMTP notification if a field worker stops sending GPS updates unexpectedly.
*   **Analytics Engine:** High-level KPIs, Hourly Punch Volume charts, and Zone Compliance doughnuts.

---

## 🏗️ Technical Architecture

The platform utilizes a **Stateless REST API** for standard operations and a **Stateful WebSocket Layer** for real-time monitoring.



---

## 📂 Folder Structure

### 💻 Backend (Node.js/Express)
```text
/backend
├── 📁 config/           # Database (Mongoose) & Swagger configuration
├── 📁 controllers/      # Route handlers (Business logic layer)
├── 📁 middleware/       # JWT Auth, RBAC, Consent check, & Rate limiters
├── 📁 models/           # Mongoose schemas (User, Attendance, Audit, Zone)
├── 📁 routes/           # RESTful route definitions
├── 📁 seeds/            # Database initialization & Admin creation scripts
├── 📁 utils/            # Logger, Nodemailer, & Stale Checker (Cron)
├── 📁 validators/       # Input validation logic (Express-Validator)
└── index.js             # Server entry point & Socket.io initialization
```

### 🎨 Frontend (React/Vite)
```text
/frontend
├── 📁 src
│   ├── 📁 components/   # UI components (Map, Dashboards, Modals)
│   ├── 📁 context/      # Global Auth & State management
│   ├── 📁 middleware/   # Frontend Route Guards & Consent Gates
│   ├── 📁 utils/        # Axios interceptors & API wrappers
│   └── App.jsx          # Route mapping & Global Providers
└── .env                 # Environment variables (API/Socket URLs)
```

---

## 📐 Mathematical Validation

The system calculates the Great-Circle distance between the employee and the zone center using the **Haversine Formula** to ensure precision despite the Earth's curvature:

$$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1\cos\phi_2\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

Where:
*   $R$ = Earth's radius (6371 km).
*   $\Delta\phi$ = Latitude difference.
*   $\Delta\lambda$ = Longitude difference.

---

## 🚀 Setup & Installation

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env file (see .env.example)
node seeds/runSeed.js   # Create Super Admin
node seeds/seedZone.js  # Setup Jodhpur Office Zone
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Set VITE_API_URL and VITE_SOCKET_URL in .env
npm run dev
```

---

## 📑 API Documentation (Partial)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue tokens |
| `POST` | `/api/attendance/punch` | User | Handle Geo-fenced Punch In/Out |
| `POST` | `/api/attendance/ping` | User | Receive remote GPS heartbeats |
| `GET` | `/api/analytics/summary` | Admin | Fetch high-level operational KPIs |
| `PUT` | `/api/users/:id/role` | Admin | Update system permissions |

---

## 🗺️ Future Roadmap
- [ ] **Geofence Scheduling:** Auto-activate zones based on shift timings.
- [ ] **Offline Sync:** Buffer pings in `indexedDB` when the connection is lost.
- [ ] **AI Insights:** Predictive alerts for erratic movement patterns.

---

> **Developed with Passion by Uthukota Sriram Abhishek**  
> *Backend Architect | Researcher*
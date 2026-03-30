# 🏥 MediQueue — Hospital Queue Management System

> Book hospital appointments & see real-time queue times across Kenya.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)

---

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd app
npm install
```

---

### 2. Seed the Database (Kenyan hospitals + demo users)

```bash
cd backend
npm run seed
```

This creates:
- 6 real Kenyan hospitals (KNH, Aga Khan, Nairobi Hospital, Mombasa, Kisumu, Nakuru)
- Departments + live queues for each hospital
- Demo accounts (see below)

---

### 3. Start the Backend

```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

---

### 4. Start the Frontend

```bash
cd app
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role        | Phone        | Password     |
|-------------|--------------|--------------|
| Patient     | 0712345678   | password123  |
| Super Admin | 0700000000   | admin1234    |

> Hospital admins are created during seed with password `admin123`

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register patient |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/hospitals` | List all hospitals |
| GET  | `/api/hospitals/:id` | Hospital + departments + queues |
| GET  | `/api/hospitals/:id/stats` | Admin stats |
| GET  | `/api/queues/hospital/:id` | All queues for hospital |
| PATCH | `/api/queues/department/:id/update` | Update queue count |
| PATCH | `/api/queues/department/:id/status` | Open/close/pause queue |
| POST | `/api/bookings` | Create booking |
| GET  | `/api/bookings/my-bookings` | Patient's bookings |
| GET  | `/api/bookings/hospital/:id` | Hospital bookings (admin) |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| PATCH | `/api/bookings/:id/status` | Update booking status (admin) |

---

## ⚡ Real-Time Events (Socket.IO)

| Event (client → server) | Description |
|--------------------------|-------------|
| `join_department` | Subscribe to department queue updates |
| `leave_department` | Unsubscribe |
| `join_hospital` | Admin subscribes to all hospital queues |
| `leave_hospital` | Unsubscribe |

| Event (server → client) | Description |
|--------------------------|-------------|
| `queue_updated` | Live queue count + estimated wait update |
| `booking_updated` | Booking status changed |

---

## 🏗️ Project Structure

```
mediqueue/
├── app/                    # React frontend (Vite + TypeScript + Tailwind)
│   └── src/
│       ├── components/     # Navbar, HospitalCard, QueueCard, ProtectedRoute
│       ├── contexts/       # AuthContext, SocketContext
│       ├── pages/          # Home, Hospitals, HospitalDetail, Bookings, Admin*
│       ├── services/       # Axios API client
│       └── types/          # TypeScript interfaces
│
└── backend/                # Node.js + Express + MongoDB
    └── src/
        ├── config/         # DB connection
        ├── middleware/      # Auth (JWT), error handler
        ├── modules/
        │   ├── auth/       # Register, login, JWT
        │   ├── hospitals/  # Hospital CRUD + stats
        │   ├── departments/# Department management
        │   ├── queues/     # Real-time queue engine
        │   └── bookings/   # Appointment booking
        ├── sockets/        # Socket.IO event handlers
        └── scripts/        # Database seed
```

---

## 💰 Monetization (SaaS)

- Small clinic: **KES 2,000/month**
- Large hospital: **KES 10,000+/month**
- Future: M-Pesa priority booking, SMS alerts, WhatsApp bot

---

## 🇰🇪 Built for Kenya

# Campus Shuttle Booking & Management System - Walkthrough

Welcome to the comprehensive walkthrough for the Campus Shuttle Booking System. This document provides step-by-step instructions for booting the local environment, simulating a booking, and testing the dynamic QR scanning system.

## 1. System Boot-Up

### A. Infrastructure (Docker)
The system relies on PostgreSQL 16 (for relational data and ACID compliance) and Redis 7 (for distributed seat locking and WebSockets).

```bash
# Start the databases in detached mode
docker-compose up -d
```

### B. Backend API Initialization
Our backend is a Node.js/TypeScript Express application leveraging Prisma ORM.

```bash
cd backend
npm install

# Push the Prisma schema to PostgreSQL to create the tables
npx prisma db push

# Start the development server (runs on http://localhost:8080)
npm run dev
```
*Note: The backend will automatically connect to Socket.io for live updates on port 8080.*

### C. Frontend PWA Initialization
The passenger and driver UI is built with React, Vite, and TailwindCSS.

```bash
cd frontend-pwa
npm install

# Start the Vite development server (typically runs on http://localhost:5173)
npm run dev
```

---

## 2. Simulating a Group Booking (Phase 3 & 4)

1. **Authentication (SSO):** 
   - Navigate to the frontend UI and simulate logging in with a `@vit.ac.in` email. The backend `auth.controller.ts` will strictly validate this domain and assign a JWT token with the `FACULTY/PRIORITY` role.
2. **Seat Selection:**
   - The React `SeatPickerGrid` will query `/api/v1/schedules/:id/availability`.
   - Select contiguous seats. The UI will prevent you from selecting greyed-out reserved seats.
3. **Locking & Confirmation:**
   - Hitting "Checkout" calls `/api/v1/booking/reserve`. The `SeatAllocationEngine` attempts to acquire an atomic `NX` lock in Redis for 300 seconds.
   - Upon successful payment simulation, `/api/v1/booking/confirm` is called, atomically saving the `Ticket` to PostgreSQL and returning the Cryptographic Seeds.

---

## 3. Testing the Dynamic QR Engine & Driver Scanner

### Passenger View
- Open the "My Tickets" page on a mobile view in your browser.
- The `DynamicQRCode` component uses the downloaded cryptographic seed to generate a time-based `HMAC-SHA256` payload every 30 seconds.
- You will see a visual countdown timer resetting at 30, 60, 90 seconds past the minute.

### Driver Scanner View
1. Open a second browser tab (simulating the driver's device) and navigate to the **Driver Terminal**.
2. Because of the RBAC middleware (`requireRole(['DRIVER', 'ADMIN'])`), ensure the active user token in this tab has `DRIVER` privileges.
3. The `@zxing/library` will request camera permissions. Allow it.
4. Point the driver tab's webcam at the passenger's screen displaying the dynamic QR code.

### Expected Validation Outcomes:
- **Success:** The backend validates the `HMAC-SHA256` hash and time step. The Driver UI turns green: **"BOARDING APPROVED"**.
- **Anti-Passback (Screenshot prevention):** If the passenger screenshots the QR code and sends it to a friend, when the friend scans it, the backend will return a 403 error. The Driver UI will turn red: **"ACCESS DENIED - Ticket has already been used (Boarded)"**.
- **Time Drift:** If the passenger tries to use a QR code generated 2 minutes ago, the backend's strict $+/- 1$ timestep window will reject it. The Driver UI will show: **"QR Code is expired or invalid"**.

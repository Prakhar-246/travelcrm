# 🌏 Travel CRM — TravelandHolidays.in

A full-stack MERN Travel Agency CRM with Lead Management, Bookings, Itinerary Builder, Finance tracking and more.

---

## 📁 Project Structure

```
travel-crm/
├── server/                  # Express + MongoDB backend
│   ├── config/db.js
│   ├── controllers/         # authController, leadController, bookingController...
│   ├── middleware/          # auth.js, errorHandler.js
│   ├── models/              # User, Lead, Booking, Hotel, Transport, Vendor, Itinerary, Package, Reminder
│   ├── routes/              # auth, leads, bookings, hotels, transport, vendors, packages, itineraries, finance, reports, users, reminders
│   ├── utils/seed.js        # Database seeder
│   ├── .env.example
│   └── index.js
│
└── client/                  # React frontend
    └── src/
        ├── context/AuthContext.js
        ├── services/api.js
        ├── components/
        │   ├── common/index.js     # Shared components
        │   └── layout/             # Sidebar, Topbar
        └── pages/
            ├── Login/
            ├── Dashboard/
            ├── Leads/
            ├── Bookings/
            ├── Hotels/
            ├── Transport/
            ├── Vendors/
            ├── Finance/
            ├── Reports/
            ├── Users/
            ├── Packages/
            ├── Itinerary/
            └── Automation/     (Reminders)
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd travel-crm
npm run install-all
```

### 2. Setup Environment

```bash
cd server
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET
```

### 3. Seed Database

```bash
cd server
node utils/seed.js
```

### 4. Run Development

```bash
# From root directory
npm run dev
```

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:3000

---

## 🔐 Default Login

| Field    | Value                              |
|----------|------------------------------------|
| Email    | admin@travelandholidays.in         |
| Password | admin123                           |

---

## 📋 Features

| Module               | Features                                                        |
|----------------------|-----------------------------------------------------------------|
| 🏠 Dashboard          | Stats, recent leads/bookings, quick actions                    |
| 🧲 Lead Management    | Table + Pipeline (Kanban) view, notes, reminders, status flow  |
| 🗺️ Itinerary Builder  | Day-wise editor, WhatsApp format, PDF preview, templates       |
| 🗓️ Bookings           | Full booking lifecycle, payment tracker, status updates        |
| 🏨 Hotel Supply       | Season pricing, room types, meal plans, contact details        |
| 🚕 Transport          | Vehicle management, driver info, assign to bookings            |
| 🤝 Vendors            | Payment history, bank details, outstanding dues tracker        |
| 💰 Finance            | Revenue, collected, pending, vendor dues, profit summary       |
| 📊 Reports            | Lead funnel, top destinations, monthly bookings chart          |
| 🔔 Reminders          | Priority-based, type-based, due date tracking                  |
| 📦 Packages           | Reusable package templates with inclusions/exclusions          |
| 👥 User Roles         | Admin / Sales / Operations role-based access                   |

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend:** React 18, React Router v6, Axios, react-hot-toast
- **Auth:** JWT Bearer token with role-based middleware

---

## 🌐 API Endpoints

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/leads                GET    /api/leads/pipeline
POST   /api/leads                POST   /api/leads/:id/notes
PUT    /api/leads/:id            POST   /api/leads/:id/reminders
DELETE /api/leads/:id

GET    /api/bookings             POST   /api/bookings/:id/payments
POST   /api/bookings             PUT    /api/bookings/:id/status
PUT    /api/bookings/:id

GET/POST /api/hotels
GET/POST /api/transport
GET/POST /api/vendors             POST   /api/vendors/:id/payments

GET/POST /api/itineraries
GET      /api/itineraries/:id/whatsapp
POST     /api/itineraries/:id/duplicate

GET /api/finance/summary
GET /api/finance/customer-payments
GET /api/finance/vendor-dues

GET /api/reports/dashboard
GET /api/reports/leads
GET /api/reports/bookings

GET/POST /api/packages
GET/POST /api/reminders
PUT      /api/reminders/:id/done

GET/POST /api/users             (Admin only)
```

---

## 📞 Support

**TravelandHolidays.in**  

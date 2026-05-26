# SupportDesk - Ticket Management Platform

SupportDesk is a production-grade, full-stack Customer Support Ticket Tracker web application built using the **MERN Stack** (MongoDB, Express.js, React.js, and Node.js) with a highly polished **Dark SaaS Dashboard** styled using utility-first **Tailwind CSS** and animated with **Framer Motion**.

The backend operates on a modular **Model-View-Controller (MVC) architecture** using native **ES6 Modules**, implementing a normalized 5-collection database structure, security audit logging, pagination queries, and automated ticket lifecycle history tracking.

---

## 📦 Normalized Database Design (support_tracker)

The MongoDB database contains 5 normalized collections:

1. **`users`**: Contains account documents with display names, hashed credentials, and role settings (Customer, Support Agent, or Admin).
2. **`tickets`**: Contains core support request summaries, priority rankings, assignment references, and creators.
3. **`comments`**: Contains conversational message threads linked directly to support tickets.
4. **`tickethistories`**: Tracks status transitions (Open → In Progress → Resolved) along with timestamps, comments, and the modifying agent's ID.
5. **`auditlogs`**: Logs critical workspace operations (such as registrations, logins, creation events, and deletions) for system audits.

---

## 🌟 Upgraded Production Features

### 🔍 Server-Side Paginated Query Engine
- **Efficient Scaling**: Backend uses Mongoose queries (`.skip()` and `.limit(5)`) to paginate listings, returning current pages and totals.
- **Unified Filtering**: Search query parameters filter results by status, priority, and text search regex queries directly at the database layer.

### 📝 Live Comment Conversations Thread
- **Interactive Thread**: Customers and agents discuss issues inside the ticket detail sheet.
- **Bespoke Styling**: Comments are color-coded in bubbles indicating user roles.

### 📜 Automated Lifecycle History Tracking
- **Transition logs**: Changing ticket status automatically writes a progress entry in the `TicketHistory` collection, displaying a timeline on the ticket page.
- **Assignee claims**: Agents automatically claim cases when they begin work or change a ticket status.

### 🔒 Audited Session Authentication
- **Secure Hashing**: Passwords salted and hashed with `bcryptjs` before DB save hooks.
- **Session logs**: Successful registrations and logins generate an `AuditLog` entry in MongoDB.
- **Protected Routes**: ProtectedRoute hooks block unauthenticated access.

---

## 📂 Project Directory Structure

```
supportdesk/
│
├── backend/
│   ├── config/
│   │   └── db.js                  ← MongoDB Atlas connection (ESM)
│   ├── controllers/
│   │   ├── authController.js      ← Authentication & Audit logging
│   │   └── ticketController.js    ← Tickets MVC controllers (Pagination, comments, history)
│   ├── middleware/
│   │   └── authMiddleware.js       ← JWT protector & role gates
│   ├── models/
│   │   ├── User.js                ← User model schema
│   │   ├── Ticket.js              ← Ticket model schema
│   │   ├── Comment.js             ← Comments model schema
│   │   ├── TicketHistory.js       ← Transition logs model
│   │   └── AuditLog.js            ← Security activity logs model
│   ├── routes/
│   │   ├── authRoutes.js          ← Auth routing endpoints (/api/auth/...)
│   │   └── ticketRoutes.js        ← Unified tickets & comments router (/api/...)
│   ├── .env                       ← Secrets and port configs
│   ├── package.json               ← Dependencies & ES Modules declarations
│   └── server.js                  ← Server bootstrapping
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js             ← Interceptor-equipped Axios instance
│   │   ├── components/
│   │   │   ├── Navbar.jsx         ← Glassmorphic responsive top navigation
│   │   │   ├── Sidebar.jsx        ← Dynamic left sidebar navigation panel
│   │   │   ├── StatsCards.jsx     ← Modular metrics card renderer
│   │   │   ├── TicketCard.jsx     ← Modern animated ticket listing card
│   │   │   ├── StatusBadge.jsx    ← Status and priority tag bubbles
│   │   │   ├── Loader.jsx         ← Custom dark neon spinner component
│   │   │   └── ProtectedRoute.jsx ← Protect routes from unauthenticated users
│   │   ├── pages/
│   │   │   ├── Login.jsx          ← Dark glass card login screen
│   │   │   ├── Register.jsx       ← Account registration screen
│   │   │   ├── Dashboard.jsx      ← Ticket feed with stats, filters & sorting
│   │   │   ├── NewTicket.jsx      ← Ticket creation form
│   │   │   └── TicketDetails.jsx  ← Details, comment threads, and activity timeline
│   │   ├── utils/
│   │   │   └── auth.js            ← Session localStorage helpers
│   │   ├── context/
│   │   │   └── AuthContext.jsx    ← Global auth context & session persistence
│   │   ├── styles/
│   │   │   └── global.css         ← Global custom styles and delay blobs
│   │   ├── App.jsx                ← App route bindings & Layout layouts
│   │   └── main.jsx               ← Client bootstrap entry
│   ├── tailwind.config.js         ← Tailwind theme config
│   ├── postcss.config.js          ← PostCSS declarations
│   ├── vite.config.js             ← Vite config
│   ├── index.html                 ← Entry page template
│   └── package.json               ← Client dependencies
│
├── Customer_Support_Ticket_Tracker_Guide.docx ← Compiled Styled Handbook Guide
└── README.md                      ← Recruiter blueprint handbook
```

---

## 🛠️ Step-by-Step Installation & Setup

### Step 1: Backend Database Configuration
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file at `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/support_tracker
   JWT_SECRET=supersecretkey_change_this_in_production
   ```
4. Start the backend Node server:
   ```bash
   npm run dev
   ```

### Step 2: Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install the client packages:
   ```bash
   npm install
   ```
3. Launch the local development web server:
   ```bash
   npm run dev
   ```
   *The application will boot up at `http://localhost:3000` (or `3001` if port 3000 is occupied).*

---

## 🔌 Backend REST API Documentation

### Base API URL
```
http://localhost:5000/api
```

### 1. Authentication Endpoints

#### POST `/auth/register`
- **Payload:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123",
    "role": "customer"
  }
  ```
- **Response (210 Created):** Returns user details and `"token"` string. Generates `REGISTER` audit log.

#### POST `/auth/login`
- **Payload:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):** Returns user details and `"token"` string. Generates `LOGIN` audit log.

---

### 2. Support Tickets & Comments Endpoints

#### GET `/tickets`
Lists support cases (paginated limit 5, searchable and filterable).
- **Query Parameters:** `page` (number), `status` (open, in-progress, resolved), `priority` (low, medium, high), `search` (string).
- **Response (200 OK):**
  ```json
  {
    "tickets": [...],
    "totalPages": 3,
    "currentPage": 1,
    "totalTickets": 25,
    "stats": { "total": 25, "open": 10, "inProgress": 10, "resolved": 5 }
  }
  ```

#### POST `/tickets`
Raises a support request (accessible by **Customers** only). Generates `CREATE_TICKET` audit log.

#### PUT `/tickets/:id/status`
Updates case status (accessible by **Agents/Admins** only). Generates `TicketHistory` progress transition entry and `UPDATE_STATUS` audit log.
- **Payload:**
  ```json
  {
    "status": "in-progress",
    "note": "Assigned support technician to investigate checkout bug"
  }
  ```

#### POST `/comments`
Adds a response message under a support ticket.
- **Payload:**
  ```json
  {
    "ticketId": "603d2b...",
    "message": "We are reviewing your request details now."
  }
  ```

#### GET `/comments?ticketId=603d2b...`
Retrieves conversation message thread for a specific ticket.
- **Response (200 OK):** Array of populated comment logs.

# SupportDesk — Ticket Management Demo

A full-stack ticket-management application with a React/Vite interface and an Express/MongoDB backend. The project describes customer and support-agent flows for creating tickets, exchanging comments, and tracking ticket status.

## Features

- Customer and support roles
- Ticket creation and status updates
- Comments on ticket conversations
- Ticket filtering and pagination
- Status history in the ticket workflow

## Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express, MongoDB/Mongoose

## Run locally

Start the backend in one terminal:

```bash
cd backend
npm install
# Configure backend environment variables for MongoDB and JWT authentication
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Use local development values for secrets and database credentials. Do not commit environment files. These setup commands follow the package scripts; they have not been run as part of this README update.

## Project status

Portfolio/demo project. No production, security certification, or performance measurements are claimed here. Review the current implementation before using it with real customer data.

# EduPredict Backend

This folder contains the Node.js + Express backend for the EduPredict application.

## Current Phase

Phase 2: database and API foundation.

## Structure

- `app.js` - app bootstrap and middleware
- `server.js` - HTTP server startup
- `config/db.js` - MySQL connection pool
- `routes/health.js` - health endpoint
- `services/dbService.js` - database connectivity helpers

## Local Setup

1. Create `.env` from `.env.example`.
2. Install dependencies using `npm install`.
3. Start the server with `npm run dev`.
4. Check `http://localhost:5000/api/health`.

## Notes

- MySQL must be running locally.
- The app validates connectivity but does not yet include full business logic.

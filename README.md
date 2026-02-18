# Expense Tracker

A robust, production-quality Expense Tracker application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Add Expense**: Record amount, category, description, and date.
- **View Expenses**: List of expenses with filtering and sorting.
- **Idempotency**: Prevents duplicate submissions using a unique key per action.
- **Data Integrity**: Money stored as integers (paise) to avoid floating-point errors.
- **Resilient UI**: Handles network retries and failures gracefully.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Frontend**: React (Vite), TailwindCSS
- **Tools**: Axios, UUID, Date-fns

## Key Design Decisions

- **Idempotency**: We use a client-generated `Idempotency-Key` header. The backend checks if a request with this key was already processed. If so, it returns the existing resource. This ensures that network retries or double-clicks do not create duplicate records.
- **Money Handling**: Storing amounts as integers (e.g., 1000 paise = ₹10.00) avoids standard floating-point precision issues in JavaScript.
- **Architecture**: Separated `frontend` and `backend` for clear concern separation.

## Local Setup

### Backend

1. Navigate to `/backend`
2. `npm install`
3. Create `.env` file with:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/expense_tracker
   ```
4. `npm start` (or `node server.js`)

### Frontend

1. Navigate to `/frontend`
2. `npm install`
3. `npm run dev`

## Deployment

- **Backend**: Ready for Render/Railway.
- **Frontend**: Ready for Vercel/Netlify.

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

## Design Decisions & Trade-offs

### Context
This project was built within a limited timebox to demonstrate a production-quality, full-stack application.

### Key Decisions
1.  **Compact UI**: Prioritized a single-screen dashboard over multi-page navigation to reduce friction and improve data density.
2.  **No Authentication**: Authenticated was omitted to focus on core CRUD features and polish within the timeframe.
3.  **Client-Side Calculations**: Totals and summaries are calculated on the client to reduce backend load for this scale of data, though server-side aggregation would be better for massive datasets.

### Trade-offs & Future Improvements
1.  **State Management**: Used local React state. For a larger app, Redux or React Query would handle caching and global state better.
2.  **Testing Coverage**: Focused on critical path unit tests and manual verification. E2E testing (Playwright/Cypress) was omitted due to time constraints.
3.  **Styling**: Used Tailwind utility classes directly. A component library or design tokens system would be better for long-term scalability.

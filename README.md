# Cricketer Management System

A modern, production-ready cricket player registration management web application built with Next.js, MongoDB, and Tailwind CSS.

## Features

- **Secure Authentication** — Login credentials loaded from environment variables
- **Admin Dashboard** — Statistics cards, category distribution chart, audit log
- **Public Registration** — Open `/dpcricketmanagement/register/form` for unauthenticated player signup
- **Cricketer List** — Search, filter, sort, pagination, view/edit/delete
- **Export** — Download registrations as Excel (.xlsx)
- **Dark/Light Mode** — System-aware theme switching
- **Responsive Design** — Mobile-friendly sidebar and layouts

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- MongoDB + Mongoose
- Tailwind CSS
- React Hook Form + Zod
- Recharts
- JWT Authentication (httpOnly cookies)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and update values:

```env
MONGODB_URI=your_mongodb_connection_string
ADMIN_CREDENTIALS=[{"email":"admin@example.com","password":"your_secure_password"}]
JWT_SECRET=your_jwt_secret_key
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your admin credentials.

**Public registration (no login):** [http://localhost:3000/dpcricketmanagement/register/form](http://localhost:3000/dpcricketmanagement/register/form)

## Default Login

Use any email/password pair defined in `ADMIN_CREDENTIALS` in your `.env` file.

Example:
```json
[{"email":"admin@example.com","password":"admin123"},{"email":"manager@example.com","password":"secure456"}]
```

## Project Structure

```
src/
├── app/                  # Pages and API routes
│   ├── api/              # REST API endpoints
│   ├── dashboard/        # Protected dashboard pages
│   └── login/            # Login page
├── components/           # Reusable UI components
├── lib/                  # Utilities, auth, validation
└── models/               # Mongoose schemas
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/cricketers` | List cricketers (with search/filter/pagination) |
| POST | `/api/cricketers` | Create registration |
| GET | `/api/cricketers/[id]` | Get single cricketer |
| PUT | `/api/cricketers/[id]` | Update cricketer |
| DELETE | `/api/cricketers/[id]` | Delete cricketer |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/export` | Export to Excel |
| GET | `/api/public/csrf` | CSRF token for public registration |
| POST | `/api/public/register` | Public registration (CAPTCHA + rate limited) |
| GET | `/api/notifications` | Admin notification feed |
| PATCH | `/api/notifications` | Mark notifications as read |

## Production Build

```bash
npm run build
npm start
```

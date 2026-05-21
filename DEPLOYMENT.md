# Deployment Guide

This project is a monorepo with:

- `Backend/`: NestJS API
- `frontend/`: Next.js app

## Backend Environment

Set these variables on your backend host:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.vercel.app
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your-postgres-user
DB_PASSWORD=your-postgres-password
DB_DATABASE=your-postgres-database
DB_SSL=true
DB_SYNCHRONIZE=true
JWT_SECRET=replace_with_a_long_random_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_google_app_password
SMTP_FROM=yourgmail@gmail.com
```

For a first classroom deployment, `DB_SYNCHRONIZE=true` is convenient. For a real production app, replace it with migrations before storing important data.

## Frontend Environment

Set this variable on your frontend host:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com
```

## Recommended Host Setup

Backend service:

- Root directory: `Backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`
- Add a PostgreSQL database and copy its connection values into the backend environment variables.

Frontend service:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Add `NEXT_PUBLIC_API_URL` with the deployed backend URL.

After both services are live, update the backend `CORS_ORIGIN` to the final frontend URL and redeploy the backend.

# Cholojai - AIUB Commute Connect

Cholojai is a web-based commute sharing system for AIUB students. The project helps students create commute posts, request to join available rides, manage accepted members, and coordinate meeting points using map-based location features.

## Student Information

**Name:** Md Parvej Mia  
**ID:** 22-49155-3  
**Course Teacher:** MD. KHAIRUL ALAM MAZUMDER  
**Designation:** Lecturer, Faculty  
**Department:** Department of Computer Science

## Project Overview

AIUB students often travel through similar routes at similar times, but there is no structured way to find trusted commute partners. Cholojai solves this by allowing verified students to share commute plans and join suitable commute posts based on route, time, seats, cost, and gender preference.

The system includes role-based access for students and admin users. Students can register, verify email with OTP, log in securely, create commute posts, request to join posts, manage their rides, and view live meeting information. Admin users can monitor users and commute posts.

## Main Functionalities

- Student registration with email OTP verification.
- Secure login using university ID and password.
- Forgot password flow with OTP verification.
- Role-based route protection for student and admin access.
- Student profile with route preference and password update.
- Commute post creation with:
  - transport type
  - route from and to
  - meeting point
  - map-selected exact location
  - departure and expiry time
  - seats
  - cost or "will be decided"
  - gender preference
- Browse commute posts with filtering and sorting.
- Request to join a commute.
- Creator approval or rejection of join requests.
- My posts page for creators to manage commute posts.
- My rides page for joined, pending, accepted, rejected, cancelled, and history rides.
- Accepted members view with map and meeting point.
- Live location sharing prompt near commute time.
- Notification system for join requests and request decisions.
- Admin pages for managing users and commute posts.
- Swagger API documentation for backend endpoints.

## Technology Stack

**Frontend**

- Next.js
- React
- Tailwind CSS
- DaisyUI
- Axios
- Zod
- Leaflet 

**Backend**

- NestJS
- TypeORM
- PostgreSQL
- JWT authentication
- HttpOnly cookie-based auth
- Nodemailer for OTP email
- Swagger for API documentation

## Project Structure

```text
AIUB Commute Connect/
├── Backend/    NestJS backend API
└── frontend/   Next.js frontend application
```

## Backend Features

The backend handles authentication, user management, commute post management, participation requests, notifications, profile updates, live location data, and admin operations. Protected routes use JWT guards and role guards.

## Frontend Features

The frontend provides responsive pages for registration, login, dashboard, browse commutes, create commute, my posts, my rides, notifications, profile, and admin management. It uses reusable components for navigation, map previews, meeting point tooltips, commute cards, and commute room views.

## Running The Project

Backend:

```bash
cd Backend
npm.cmd run start:dev
```

Frontend:

```bash
cd frontend
npm run dev -- -p 5000
```

Backend URL:

```text
http://localhost:3000
```

Frontend URL:

```text
http://localhost:5000
```

Swagger API Documentation:

```text
http://localhost:3000/api
```

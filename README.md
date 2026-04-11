# Nile Agency - MERN Stack Recruitment Platform

A production-level recruitment platform connecting employees and recruiters with real-time chat, payment integration, and admin dashboard.

## Quick Start

```bash
# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Configure backend .env file
cp server/.env server/.env.local
# Edit server/.env.local with your credentials

# Start MongoDB (required)
mongod

# Run development servers
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Admin: http://localhost:5173/admin/login

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Socket.io Client
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io
- **Integrations**: Stripe, Chapa, Cloudinary

## Features

- JWT Authentication with role selection
- Employee: Browse jobs, apply, save, chat
- Recruiter: Post jobs, manage applicants, company profile
- Admin: Dashboard, user management, analytics
- Real-time messaging with online status
- Payment integration (Stripe + Chapa)

## Deployment

See DEPLOYMENT.md for detailed deployment instructions.
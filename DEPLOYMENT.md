# Nile Agency - Deployment Guide

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe Account
- Cloudinary Account

## Development Setup

1. **Install Dependencies**
```bash
cd /Users/macintoshhd/Desktop/NileAgency
npm install
cd server && npm install
cd ../client && npm install
```

2. **Configure Environment Variables**

Create `.env` in `/server`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development

# Stripe (get from stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Chapa (get from chapaper.com)
CHAPA_SECRET_KEY=your_chapa_key

# Cloudinary (get from cloudinary.com)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# Admin credentials
ADMIN_EMAIL=admin@nileagency.com
ADMIN_PASSWORD=admin123
```

3. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env with your Atlas connection string
```

4. **Run Development Server**
```bash
# From project root - runs both backend and frontend
npm run dev

# Or separately:
cd server && npm run dev  # Backend on port 5000
cd client && npm run dev # Frontend on port 5173
```

## Production Deployment

### Backend (Render/Railway/Heroku)

1. Create a new Web Service on Render.com:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variables: Add all .env variables

2. MongoDB: Use MongoDB Atlas (free tier)

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - VITE_API_URL=your_backend_url

## Project Structure

```
NileAgency/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # Dashboard, Auth, Chat pages
│   │   ├── services/     # API calls
│   │   ├── context/      # Auth context
│   │   └── App.jsx       # Main app
│   └── package.json
├── server/                 # Express Backend
│   ├── routes/           # API routes
│   ├── models/           # MongoDB models
│   ├── middlewares/      # Auth middleware
│   ├── server.js        # Server entry
│   └── package.json
├── package.json          # Root scripts
└── DEPLOYMENT.md        # This file
```

## Features Implemented

- JWT Authentication
- Role-based access (Employee/Recruiter/Admin)
- Real-time chat (Socket.io)
- Job posting & applications
- Search & filtering
- Stripe & Chapa payment integration
- File upload (Cloudinary)
- Admin dashboard

## Troubleshooting

1. **MongoDB Connection Error**
   - Check MONGO_URI in .env
   - Ensure MongoDB is running

2. **Socket.io not working**
   - Check CORS settings in server.js
   - Ensure port 5000 is accessible

3. **Payment failures**
   - Verify Stripe keys are correct
   - Check webhook endpoints

## Admin Access

- URL: `/admin/login`
- Credentials: Set in ADMIN_EMAIL/ADMIN_PASSWORD in .env
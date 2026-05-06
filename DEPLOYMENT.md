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

---

## cPanel Deployment Guide (bonsaagency.com)

### Step 1: MongoDB Atlas Setup (Required - cPanel doesn't support MongoDB)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Create a database user with username/password
4. Allow access from anywhere (0.0.0.0/0) in Network Access
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/nileagency
   ```

### Step 2: Push Code to GitHub

Your code is already on GitHub: `https://github.com/sabboonaa22735/NileAgency.git`

Make sure all changes are pushed:
```bash
git add .
git commit -m "Prepare for cPanel deployment"
git push origin main
```

### Step 3: cPanel - Setup Git Repository

1. Login to cPanel (https://bonsaagency.com/cpanel)
2. Go to **Git Version Control** (under Files section)
3. Click **Create**
4. Fill in:
   - **Repository Path**: `/home/yourusername/NileAgency`
   - **Repository URL**: `https://github.com/sabboonaa22735/NileAgency.git`
   - **Branch**: `main`
5. Click **Create**
6. After creation, click **Manage** and note the **Clone URL**

### Step 4: cPanel - Setup Node.js App

1. Go to **Setup Node.js App** (under Software section)
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or 20.x (LTS)
   - **Application mode**: Production
   - **Application root**: `NileAgency/server`
   - **Application URL**: `bonsaagency.com`
   - **Application startup file**: `server.js`
   - **Passenger log file**: `/home/yourusername/logs/nodeapp.log`
4. Click **Create**
5. Note the **Path to the Node.js executable** (you'll need it for SSH commands)

### Step 5: Build Frontend

Via SSH/Terminal in cPanel:

```bash
# Navigate to project root
cd /home/yourusername/NileAgency

# Install root dependencies
npm install

# Install and build client
cd client
npm install
npm run build
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### Step 6: Configure Environment Variables

1. In cPanel, go to **Setup Node.js App**
2. Find your app and click **Edit**
3. Scroll to **Environment Variables**
4. Add the following:

| Variable | Value |
|----------|-------|
| NODE_ENV | production |
| PORT | 5001 |
| MONGO_URI | mongodb+srv://user:pass@cluster.mongodb.net/nileagency |
| JWT_SECRET | Generate a random 64-char string |
| FRONTEND_URL | https://bonsaagency.com |
| STRIPE_SECRET_KEY | sk_live_your_key |
| STRIPE_WEBHOOK_SECRET | whsec_your_secret |
| CHAPA_SECRET_KEY | your_chapa_key |
| CLOUDINARY_NAME | your_cloud_name |
| CLOUDINARY_KEY | your_api_key |
| CLOUDINARY_SECRET | your_api_secret |
| ADMIN_EMAIL | admin@bonsaagency.com |
| ADMIN_PASSWORD | strong_password_here |
| GOOGLE_CLIENT_ID | your_google_client_id |
| GOOGLE_CLIENT_SECRET | your_google_secret |
| EMAIL_HOST | smtp.gmail.com |
| EMAIL_PORT | 587 |
| EMAIL_USER | your_email@gmail.com |
| EMAIL_PASS | your_app_password |
| EMAIL_FROM | your_email@gmail.com |

5. Click **Save**
6. Click **Restart** to apply changes

### Step 7: Configure .htaccess (if needed)

Create/edit `.htaccess` in `public_html`:

```apache
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:5001/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:5001/$1 [P,L]
```

### Step 8: Verify Deployment

1. Visit https://bonsaagency.com
2. Check that the frontend loads
3. Test registration/login
4. Test chat functionality (Socket.io)

### Step 9: Update Code (Future Deployments)

1. Push changes to GitHub
2. In cPanel, go to **Git Version Control**
3. Click **Pull or Deploy**
4. Click **Pull** to fetch changes
5. Via SSH, rebuild frontend and restart:
   ```bash
   cd /home/yourusername/NileAgency/client && npm run build
   cd /home/yourusername/server && npm install
   ```
6. In cPanel Node.js App, click **Restart**

---

## Production Deployment (Alternative Platforms)

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
   - VITE_API_URL=/api

---

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

---

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
   - Ensure MongoDB Atlas allows your IP

2. **Socket.io not working**
   - Check CORS settings in server.js
   - Ensure WebSocket is enabled in cPanel

3. **Payment failures**
   - Verify Stripe keys are correct
   - Check webhook endpoints

4. **404 Errors on refresh**
   - Server.js serves index.html for all non-API routes
   - Ensure Node.js app is running

5. **Node.js app not starting**
   - Check Passenger log file for errors
   - Verify all environment variables are set

## Admin Access

- URL: `/admin/login`
- Credentials: Set in ADMIN_EMAIL/ADMIN_PASSWORD in .env

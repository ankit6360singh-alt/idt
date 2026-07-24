# 🚀 TRAVLO Deployment Guide

Complete guide to deploy your TRAVLO app to production.

---

## 📋 Deployment Options

### Option 1: **Vercel (Frontend) + Render (Backend)** ⭐ RECOMMENDED
- ✅ Free tier available
- ✅ Easy setup
- ✅ Auto-deploys from Git
- ✅ Built-in SSL

### Option 2: **Netlify (Frontend) + Railway (Backend)**
- ✅ Free tier available
- ✅ Good performance

### Option 3: **Full Stack on Render**
- ✅ Everything in one place
- ✅ Free tier available

---

## 🎯 RECOMMENDED: Vercel + Render + MongoDB Atlas

This is the best free option for TRAVLO.

---

## 📦 Pre-Deployment Checklist

### 1. Get Your Google API Key
Follow `SETUP_REAL_DATA.md` to get your API key first!

### 2. Create GitHub Repository
```bash
cd c:\Users\Win11\OneDrive\Documents\idt2
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/travlo.git
git push -u origin main
```

### 3. Set Up MongoDB Atlas (Free Cloud Database)
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a **FREE M0 Cluster**
4. Click **Connect** → **Connect your application**
5. Copy connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/travlo?retryWrites=true&w=majority
   ```
6. Save this - you'll need it!

---

## 🔧 STEP 1: Deploy Backend to Render

### 1. Go to Render
Visit: https://render.com/ and sign up

### 2. Create New Web Service
- Click **New** → **Web Service**
- Connect your GitHub repository
- Select the repository: `travlo`

### 3. Configure Build Settings
```
Name: travlo-backend
Region: Singapore (or closest to you)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 4. Add Environment Variables
Click **Environment** and add:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/travlo
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_API_KEY_HERE
GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_API_KEY_HERE
OPENWEATHER_API_KEY=demo_key
```

⚠️ **IMPORTANT**: Replace:
- MongoDB URI with your Atlas connection string
- Google API key with your actual key
- JWT secret with a random secure string

### 5. Deploy
- Click **Create Web Service**
- Wait 3-5 minutes for deployment
- Copy your backend URL (e.g., `https://travlo-backend.onrender.com`)

---

## 🌐 STEP 2: Deploy Frontend to Vercel

### 1. Go to Vercel
Visit: https://vercel.com/ and sign up with GitHub

### 2. Import Project
- Click **Add New** → **Project**
- Select your `travlo` repository
- Click **Import**

### 3. Configure Project
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. Add Environment Variables
Click **Environment Variables** and add:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_API_KEY_HERE
VITE_API_URL=https://travlo-backend.onrender.com
```

⚠️ Replace `https://travlo-backend.onrender.com` with YOUR actual Render backend URL!

### 5. Deploy
- Click **Deploy**
- Wait 2-3 minutes
- Your app will be live at: `https://travlo-xxxxx.vercel.app`

---

## 🔗 STEP 3: Connect Frontend to Backend

### Update Frontend API Calls

Edit: `frontend/src/pages/HomePage.jsx` and `frontend/src/context/AuthContext.jsx`

Change API calls from:
```javascript
fetch('/api/trip/generate', ...)
```

To:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
fetch(`${API_URL}/api/trip/generate`, ...)
```

### Update CORS in Backend

Edit: `backend/server.js`

Change:
```javascript
app.use(cors())
```

To:
```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://travlo-xxxxx.vercel.app', // Your Vercel URL
        'https://your-custom-domain.com'   // If you have one
    ],
    credentials: true
}))
```

### Commit and Push
```bash
git add .
git commit -m "Configure for production deployment"
git push
```

Both Vercel and Render will **auto-redeploy** when you push!

---

## ✅ STEP 4: Test Your Deployed App

### 1. Visit Your Vercel URL
Open: `https://travlo-xxxxx.vercel.app`

### 2. Test Features
- ✅ Sign up / Login
- ✅ Generate trip
- ✅ View itinerary
- ✅ Check map display
- ✅ Click location badges

### 3. Check Backend Health
Visit: `https://travlo-backend.onrender.com/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "TRAVLO Backend is running",
  "features": {
    "googlePlaces": true,
    "authentication": true,
    "database": true
  }
}
```

---

## 🎨 STEP 5: Add Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `travlo.com`)
3. Update DNS records as instructed
4. SSL certificate is automatic!

### For Render (Backend):
1. Go to your service → **Settings** → **Custom Domain**
2. Add subdomain (e.g., `api.travlo.com`)
3. Update DNS records

---

## 🔒 Production Security Checklist

### ✅ Before Going Live:

1. **Environment Variables**
   - ✅ All API keys in environment variables (NOT in code)
   - ✅ Strong JWT secret (minimum 32 characters)
   - ✅ MongoDB connection string secured

2. **CORS Configuration**
   - ✅ Only allow your frontend domain
   - ✅ Remove `localhost` from production CORS

3. **Rate Limiting**
   - ✅ Already implemented in `server.js`
   - ✅ Consider lowering limits for production

4. **API Key Restrictions**
   - ✅ In Google Cloud Console, restrict API key to:
     - Your Vercel domain
     - Your Render backend domain

5. **Database Security**
   - ✅ MongoDB Atlas IP whitelist (or allow all for Render)
   - ✅ Strong database password

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | ✅ Free | 100GB bandwidth/month |
| **Render** | ✅ Free | 750 hours/month, sleeps after 15min inactivity |
| **MongoDB Atlas** | ✅ Free | 512MB storage |
| **Google APIs** | ✅ $200 credit/month | ~10,000 requests/month free |

**Total Cost: $0/month** for moderate usage! 🎉

---

## 🐛 Common Deployment Issues

### Issue 1: "Cannot connect to backend"
**Solution:**
- Check CORS settings in `backend/server.js`
- Verify `VITE_API_URL` in Vercel environment variables
- Check Render logs for errors

### Issue 2: "Database connection failed"
**Solution:**
- Verify MongoDB Atlas connection string
- Check IP whitelist (allow all: `0.0.0.0/0`)
- Ensure database user has correct permissions

### Issue 3: "Google Maps not loading"
**Solution:**
- Add Vercel domain to Google API key restrictions
- Check browser console for API key errors
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set

### Issue 4: "Render service sleeping"
**Solution:**
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid tier ($7/month) for always-on

---

## 🚀 Deployment Commands Quick Reference

### Push Updates
```bash
git add .
git commit -m "Your update message"
git push
```
Both services auto-deploy on push!

### View Logs
- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → View logs

### Rollback
- **Render**: Dashboard → Rollback to previous deploy
- **Vercel**: Dashboard → Deployments → Promote to production

---

## 📊 Monitoring Your App

### Render Dashboard
- View real-time logs
- Monitor CPU/Memory usage
- Check deployment status

### Vercel Analytics
- Page views
- Performance metrics
- Error tracking

### MongoDB Atlas
- Database size
- Connection count
- Query performance

---

## 🎯 Post-Deployment Optimization

### 1. Enable Caching
Add to `backend/server.js`:
```javascript
app.use((req, res, next) => {
    res.set('Cache-Control', 'public, max-age=300') // 5 minutes
    next()
})
```

### 2. Compress Responses
```bash
cd backend
npm install compression
```

Add to `server.js`:
```javascript
import compression from 'compression'
app.use(compression())
```

### 3. Monitor Performance
- Use Vercel Analytics
- Set up error tracking (Sentry)
- Monitor API usage in Google Cloud Console

---

## 🎉 You're Live!

Your TRAVLO app is now deployed and accessible worldwide!

**Share your app:**
- Frontend: `https://travlo-xxxxx.vercel.app`
- Backend API: `https://travlo-backend.onrender.com`

**Next steps:**
1. Test all features thoroughly
2. Share with friends for feedback
3. Monitor usage and errors
4. Iterate and improve!

---

## 📞 Need Help?

**Common Resources:**
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

**Check Logs:**
- Render: Real-time logs in dashboard
- Vercel: Deployment logs
- Browser: F12 → Console for frontend errors

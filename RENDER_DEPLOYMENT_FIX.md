# 🚀 Render.com Deployment Fix Guide

## ❌ Current Issues

1. API_URL is undefined (cron job not working)
2. Environment variables not set in Render
3. Image URLs won't work across devices

## ✅ Step-by-Step Fix

### 1. **Set Environment Variables in Render Dashboard**

Go to: **Render Dashboard → Your Service → Environment Tab**

Add these **exact** variables:

```
NODE_ENV=production
PORT=10000
API_URL=https://node-js-online-service.onrender.com
DB_URI=mongodb+srv://your-actual-mongodb-connection-string
JWT_SECRET=your-actual-jwt-secret-key
DEV_MODE=false
```

⚠️ **Important**: Replace the DB_URI and JWT_SECRET with your actual values!

### 2. **Redeploy After Setting Variables**

After adding environment variables:

1. Go to **Manual Deploy** tab in Render
2. Click **Deploy latest commit**
3. Wait for deployment to complete

### 3. **Verify Deployment Logs**

After redeployment, you should see:

```
✅ Cron job started for keep-alive pings
🔄 Keep-alive pings will be sent every 14 minutes to: https://node-js-online-service.onrender.com
Server running in production mode on port 10000
```

### 4. **Test API Endpoints**

Try these URLs:

- ✅ https://node-js-online-service.onrender.com/
- ✅ https://node-js-online-service.onrender.com/api/products/get-all-product

### 5. **Run Image Migration (One Time)**

After successful deployment, run the migration:

**Option A: Using Render Shell**

1. Go to Render Dashboard → Your Service → Shell tab
2. Run: `npm run migrate:images`

**Option B: Using Local Terminal**

1. Make sure your local .env has the production DB_URI
2. Run: `npm run migrate:images`

## 🔍 **Environment Variables Explanation**

| Variable     | Purpose                     | Value                                         |
| ------------ | --------------------------- | --------------------------------------------- |
| `NODE_ENV`   | Tells app it's production   | `production`                                  |
| `PORT`       | Render requires port 10000  | `10000`                                       |
| `API_URL`    | For cron job and image URLs | `https://node-js-online-service.onrender.com` |
| `DB_URI`     | MongoDB connection          | Your actual MongoDB Atlas URI                 |
| `JWT_SECRET` | JWT token signing           | Your secret key                               |
| `DEV_MODE`   | Development features        | `false`                                       |

## 🚨 **Common Mistakes**

❌ **Don't** create a .env file in your repo (it won't be deployed)
❌ **Don't** use localhost URLs in production
❌ **Don't** forget to redeploy after adding env vars
✅ **Do** set variables in Render dashboard
✅ **Do** use the exact Render URL for API_URL
✅ **Do** redeploy after setting variables

## 📱 **Image Fix Verification**

After deployment and migration:

1. Upload a product from Device A
2. Check the product list from Device B
3. Images should now work on all devices!

## 🆘 **If Still Not Working**

1. Check Render logs for errors
2. Verify all environment variables are set correctly
3. Make sure MongoDB connection string is correct
4. Test API endpoints manually in browser

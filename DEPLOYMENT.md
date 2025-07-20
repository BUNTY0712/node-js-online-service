# Deployment Instructions for Render.com

## Keep-Alive Cron Job Setup

This project includes a cron job to prevent your Render.com free tier app from spinning down due to inactivity.

### How it works:

- Sends a GET request to your app every 14 minutes
- Keeps the app "alive" and prevents cold starts
- Only runs in production when `API_URL` environment variable is set

### Environment Variables Required for Render:

1. **NODE_ENV** = `production`
2. **PORT** = `10000` (Render uses this port)
3. **DB_URI** = Your MongoDB Atlas connection string
4. **JWT_SECRET** = A secure JWT secret key
5. **DEV_MODE** = `false`
6. **API_URL** = `https://your-app-name.onrender.com` (Replace with your actual Render URL)

### Deployment Steps:

1. **Create a new Web Service on Render.com**
2. **Connect your GitHub repository**
3. **Set the following:**
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Add all environment variables** in the Render dashboard
5. **Deploy**

### Important Notes:

- Make sure to replace `your-app-name` in the `API_URL` with your actual Render app name
- The cron job will start automatically when deployed with the correct environment variables
- Check the logs to verify the cron job is working (you should see keep-alive ping messages every 14 minutes)

### Troubleshooting:

If the cron job isn't working:

1. Check that `API_URL` is set correctly in Render environment variables
2. Verify the URL is accessible (your app should respond to GET requests at the root path)
3. Check the application logs for cron job messages
4. Ensure `NODE_ENV=production` is set

### Local Development:

For local development, the cron job will be disabled automatically. Use `npm run dev` to start with nodemon for development.

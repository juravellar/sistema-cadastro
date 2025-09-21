# Deployment Guide

## Railway Deployment Issues Fixed

### Issues Identified and Fixed:

1. **Healthcheck Endpoint Mismatch**

   - **Problem**: Railway was checking `/status` but the app had `/api/health`
   - **Fix**: Updated `railway.json` to use `/api/health`

2. **Database Connection Issues**

   - **Problem**: App was trying to connect to `::1:5432` (IPv6 localhost) instead of Railway's PostgreSQL
   - **Fix**: Modified database creation script to skip local database creation when `DATABASE_URL` is present

3. **Production Error Handling**

   - **Problem**: App would crash if database connection failed
   - **Fix**: Added graceful error handling for production environment

4. **Docker Security**
   - **Problem**: Container was running as root user
   - **Fix**: Added non-root user for better security

## Required Environment Variables

### For Railway Deployment:

Railway automatically provides these variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (usually 3000)
- `NODE_ENV` - Set to "production"

### You need to set these in Railway dashboard:

- `SESSION_SECRET` - A secure random string for session encryption
- `FRONTEND_URL` - Your frontend domain (if different from Railway URL)
- `BACKEND_URL` - Your backend domain (if different from Railway URL)

### Example Railway Environment Variables:

```
SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-random
FRONTEND_URL=https://your-app.railway.app
BACKEND_URL=https://your-app.railway.app
```

## Database Setup

1. **Add PostgreSQL Service**: In Railway dashboard, add a PostgreSQL service
2. **Connect Services**: Link the PostgreSQL service to your app
3. **Environment Variables**: Railway will automatically set `DATABASE_URL`

## Deployment Steps

1. Push your code to GitHub
2. Connect Railway to your GitHub repository
3. Add PostgreSQL service in Railway
4. Set environment variables in Railway dashboard
5. Deploy

## Health Check

The app now properly responds to health checks at `/api/health` endpoint.

## Troubleshooting

If you still see connection issues:

1. Verify PostgreSQL service is running in Railway
2. Check that `DATABASE_URL` is set in environment variables
3. Ensure `SESSION_SECRET` is set
4. Check Railway logs for detailed error messages

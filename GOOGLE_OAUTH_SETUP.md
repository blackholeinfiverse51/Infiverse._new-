# Google OAuth Configuration Setup Guide

## Steps to Enable Google OAuth:

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URIs:
   - For development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
7. Copy the Client ID and Client Secret

### 2. Add to .env file (server folder)

Add these variables to your `server/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Frontend URL (for redirects after authentication)
FRONTEND_URL=http://localhost:5173
```

### 3. Add to .env file (client folder) - OPTIONAL

If you want to use environment variables on the client side:

```env
VITE_API_URL=http://localhost:5000
```

### 4. For Production Deployment

Update the redirect URI to your production domain:

```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

Also update the authorized redirect URIs in Google Cloud Console to include your production domain.

### 5. Test the Integration

1. Start the server: `cd server && npm start`
2. Start the client: `cd client && npm run dev`
3. Go to login/signup page
4. Click "Continue with Google"
5. Authorize the application
6. You should be redirected back and logged in

## Security Notes:

- Never commit your `.env` file to version control
- Keep your Client Secret secure
- Use HTTPS in production
- Regularly rotate your OAuth credentials
- Set up proper CORS settings

## Troubleshooting:

- **Redirect URI mismatch**: Make sure the redirect URI in Google Console exactly matches the one in your .env file
- **OAuth consent screen**: You may need to configure the OAuth consent screen in Google Cloud Console
- **Missing scopes**: Ensure you're requesting the correct scopes (profile, email)

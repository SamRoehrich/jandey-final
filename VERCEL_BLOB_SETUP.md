# Vercel Blob Storage Setup

This application now supports Vercel Blob storage for media uploads. Here's how to set it up:

## 1. Add Blob Storage to Your Vercel Project

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database" and select "Blob"
4. Follow the setup process

## 2. Get Your Blob Token

Once Blob storage is created:

1. Go to your project's Storage settings
2. Find the "Blob" storage instance
3. Copy the `BLOB_READ_WRITE_TOKEN`

## 3. Set Environment Variable

Add the token to your environment variables:

```bash
# In production (Vercel dashboard)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# In development (.env.local)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

## 4. How It Works

- **With Token**: Media uploads go to Vercel Blob storage
- **Without Token**: Media uploads use local filesystem (fallback)
- **Automatic**: The plugin handles everything - no custom routes needed

## 5. Testing

1. Start the development server: `npm run dev`
2. Go to the admin panel: `http://localhost:3000/admin`
3. Navigate to Media
4. Upload an image - it should work with either storage method

## 6. Deployment

When deploying to Vercel, make sure the `BLOB_READ_WRITE_TOKEN` environment variable is set in your project settings. The app will automatically use blob storage in production.

## Notes

- Local development works without the token (uses local storage)
- Production deployment requires the token for blob storage
- The plugin handles client-side uploads automatically
- No additional configuration needed

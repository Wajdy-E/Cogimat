# Media Migration to Vercel Blob Storage

This guide explains the migration from local media storage to Vercel Blob storage for all exercise images and videos.

## Overview

The migration addresses the issue where public exercises' images weren't visible to other users because they were stored locally. By moving to Vercel Blob storage, all media becomes publicly accessible via CDN URLs.

## What's Changed

### Backend Changes

1. **New API Endpoint**: `/api/exercise-media-upload`

   - Handles both image and video uploads
   - Organizes files in `exercise-media/images/` and `exercise-media/videos/` folders
   - Returns public Vercel Blob URLs

2. **Updated Custom Exercise API**: `/api/custom-exercise`

   - Automatically uploads local files to Vercel Blob during creation/update
   - Stores Vercel Blob URLs in the database

3. **Updated Admin Video Upload API**: `/api/admin/video-upload`
   - Supports both base64 uploads (legacy) and Vercel Blob URLs (new)
   - Maintains backward compatibility

### Frontend Changes

1. **New Media Upload Utility**: `frontend/lib/exerciseMediaUpload.ts`

   - Provides functions for uploading images and videos
   - Handles React Native file uploads properly

2. **Updated Components**:
   - `ExerciseVideoUpload`: Now uses Vercel Blob upload
   - `AdminVideoUpload`: Now uses Vercel Blob upload
   - `CreateExerciseStep1`: Media uploads go through new system
   - Data sagas: Updated to use new upload system

## File Organization in Vercel Blob

```
exercise-media/
├── images/
│   ├── exercise-123-1703123456789.jpg
│   └── exercise-456-1703123456790.png
└── videos/
    ├── exercise-123-1703123456789.mp4
    └── exercise-456-1703123456790.mov
```

## Migration Steps

### 1. Environment Setup

Ensure your Vercel Blob environment variables are configured:

```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 2. Run Migration Script (Optional)

If you have existing local media files, run the migration script:

```bash
cd backend
node scripts/migrate-media-to-blob.js
```

**Note**: This script requires the files to be accessible via HTTP URLs. If your files are stored locally on the server, you'll need to modify the script to read from the local file system.

### 3. Update Existing Media URLs

For any existing exercises with local media URLs, you can update them manually or through your admin interface. The new system will automatically handle new uploads.

### 4. Test the Migration

1. Create a new custom exercise with an image and video
2. Verify the media is accessible via Vercel Blob URLs
3. Make the exercise public and verify others can see the media
4. Test video uploads through the admin interface

## Benefits

1. **Public Access**: All media is now publicly accessible via CDN
2. **Better Performance**: Vercel Blob provides global CDN distribution
3. **Scalability**: No server storage limitations
4. **Reliability**: Vercel Blob provides high availability
5. **Cost Effective**: Pay only for what you use

## Backward Compatibility

The system maintains backward compatibility:

- Existing Vercel Blob URLs continue to work
- YouTube URLs continue to work
- The admin video upload API supports both old and new formats

## Troubleshooting

### Common Issues

1. **Upload Failures**: Check Vercel Blob token and permissions
2. **File Size Limits**: Vercel Blob has limits (check documentation)
3. **File Type Restrictions**: Ensure supported file types

### Debug Steps

1. Check browser network tab for upload requests
2. Verify Vercel Blob environment variables
3. Check server logs for upload errors
4. Test with smaller files first

## File Size Limits

- **Images**: Recommended under 10MB
- **Videos**: Recommended under 100MB
- Check Vercel Blob documentation for current limits

## Security Considerations

- All uploaded files are public by default
- Consider implementing file type validation
- Monitor upload usage and costs
- Implement rate limiting if needed

## Cost Considerations

- Vercel Blob charges per GB stored and transferred
- Monitor usage in Vercel dashboard
- Consider implementing file size limits
- Archive old media if needed

## Support

If you encounter issues:

1. Check Vercel Blob documentation
2. Review server logs
3. Test with minimal examples
4. Contact Vercel support if needed

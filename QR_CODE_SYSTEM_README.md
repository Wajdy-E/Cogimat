# QR Code-Based Access System

This system allows customers to gain access to your app by scanning QR codes that come with your physical products. Only users with valid QR codes can access the app's basic features.

## System Overview

- **10,000 unique QR codes** stored in the database
- **50 QR codes per printable page** (5x10 grid layout)
- **Camera-based QR code scanning** in the mobile app
- **Admin interface** for managing QR codes and viewing usage statistics
- **Secure validation** - each QR code can only be used once

## Database Setup

### 1. Run the Database Migrations

Execute these SQL files in your database:

```sql
-- Run the QR codes table schema
\i backend/database_schema_qr_codes.sql

-- Run the users table migration
\i backend/database_migration_qr_access.sql
```

### 2. Generate QR Codes

Use the admin interface or run the database function:

```sql
-- Generate 10,000 QR codes (50 per page)
SELECT generate_qr_codes(10000, 50);
```

## API Endpoints

### QR Code Signup

- **POST** `/api/auth/qrcode-signup`
- Validates QR code and creates user with access

### Admin QR Code Management

- **POST** `/api/admin/qr-codes` - Generate QR codes
- **GET** `/api/admin/qr-codes` - Get QR codes and statistics
- **GET** `/api/admin/qr-codes/print?page=X` - Get printable QR code data

## Frontend Components

### QR Code Scanner

- **File**: `frontend/components/QRCodeScanner.tsx`
- **Features**: Camera-based QR code scanning with validation

### QR Code Signup Screen

- **File**: `frontend/app/(auth)/qr-signup.tsx`
- **Features**: Complete signup flow with QR code validation

### Admin QR Code Management

- **File**: `frontend/app/(admin)/qr-codes.tsx`
- **Features**: Generate codes, view statistics, download printable pages

## User Flow

1. **Customer receives physical product** with QR code
2. **Customer downloads app** and opens it
3. **App shows QR code signup screen** (no other access methods)
4. **Customer scans QR code** using device camera
5. **App validates QR code** with backend
6. **Customer fills out registration form** (name, email)
7. **Account is created** with QR code access granted
8. **Customer can now use all basic app features**

## Admin Workflow

1. **Generate QR codes** using admin interface
2. **Download printable pages** (PNG format)
3. **Print QR code pages** and include with products
4. **Monitor usage statistics** through admin interface
5. **Track which codes have been used** and by whom

## QR Code Format

QR codes follow this format:

```
COGIMAT-000001-a1b2c3d4
COGIMAT-000002-e5f6g7h8
...
COGIMAT-010000-i9j0k1l2
```

- **Prefix**: `COGIMAT-`
- **Sequence**: 6-digit zero-padded number
- **Hash**: 8-character random hash for uniqueness

## Printing QR Codes

### Using the Script

```bash
cd backend
node scripts/generate-qr-codes.js
```

This will generate PNG files in `backend/qr-codes-output/` with:

- 50 QR codes per page
- 5x10 grid layout
- Professional formatting with headers
- Code text below each QR code

### Manual Generation

Use the admin interface to:

1. Generate QR codes in the database
2. Download page data via API
3. Create custom layouts as needed

## Security Features

- **One-time use**: Each QR code can only be used once
- **Unique validation**: QR codes are cryptographically secure
- **Access tracking**: All usage is logged with timestamps
- **User association**: QR codes are linked to specific users

## Configuration

### Environment Variables

```env
SUPABASE_CONNECTION_STRING=your_database_connection_string
BASE_URL=your_backend_url
```

### App Permissions

The app requires camera permissions for QR code scanning:

- **iOS**: Added to `app.json` with usage description
- **Android**: Added to `app.json` permissions array

## Dependencies

### Backend

```json
{
	"qrcode": "^1.5.3",
	"canvas": "^2.11.2"
}
```

### Frontend

```json
{
	"expo-camera": "~16.0.6",
	"expo-barcode-scanner": "~12.9.3"
}
```

## Troubleshooting

### Common Issues

1. **Camera permissions denied**

   - Check app permissions in device settings
   - Ensure camera permissions are properly configured in `app.json`

2. **QR codes not generating**

   - Check database connection
   - Ensure database functions are created
   - Verify admin privileges

3. **QR code validation fails**

   - Check QR code format (must start with "COGIMAT-")
   - Verify QR code hasn't been used before
   - Check database connectivity

4. **Printing issues**
   - Install required dependencies: `npm install qrcode canvas`
   - Ensure output directory is writable
   - Check Node.js version compatibility

### Database Queries

Check QR code status:

```sql
SELECT COUNT(*) as total,
       COUNT(CASE WHEN is_used = true THEN 1 END) as used,
       COUNT(CASE WHEN is_used = false THEN 1 END) as unused
FROM qr_codes;
```

Find used QR codes:

```sql
SELECT code, used_by, used_at
FROM qr_codes
WHERE is_used = true
ORDER BY used_at DESC;
```

## Future Enhancements

- **QR code expiration dates**
- **Batch-specific QR codes** for different products
- **Analytics dashboard** for usage patterns
- **QR code regeneration** for lost/damaged codes
- **Bulk QR code operations** for large-scale deployments

## Support

For technical support or questions about the QR code system, please contact the development team or refer to the main project documentation.

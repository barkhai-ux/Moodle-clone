# Netlify Deployment Guide

## Build Issues Fixed

The following build issues have been resolved:

### ✅ Dynamic Server Usage Errors
- **Problem**: API routes using `request.url` couldn't be statically rendered
- **Solution**: Added `export const dynamic = 'force-dynamic'` to problematic API routes
- **Files Fixed**: 
  - `app/api/courses/route.ts`
  - `app/api/users/route.ts`
  - `app/api/user/enrollments/route.ts`
  - `app/api/grades/route.ts`
  - `app/api/admin/grades/export/route.ts`

### ✅ Database Connection Errors
- **Problem**: Build process tried to connect to database during static generation
- **Solution**: Made database seeding optional and graceful error handling
- **Files Fixed**:
  - `prisma/seed.ts` - Added connection check and graceful failure
  - `package.json` - Made seeding non-blocking with `|| echo 'Database seeding skipped'`
  - `lib/prisma.ts` - Added better error handling and logging

### ✅ Prisma Client Generation
- **Problem**: Prisma client not generated during build
- **Solution**: Added `prisma generate` to build script
- **Result**: Prisma client is now generated before Next.js build

## Hardcoded Credentials

The application now includes hardcoded credentials for deployment testing:

### Test Accounts
- **Admin**: `admin@example.com` / `password123`
- **Teacher**: `teacher@example.com` / `password123`
- **Student**: `student@example.com` / `password123`

### Authentication Flow
1. **Primary**: Tries database authentication
2. **Fallback**: Uses hardcoded credentials if database fails
3. **Build Time**: Works without database connection

## Netlify Configuration

### Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 18.x or higher

### Environment Variables (Optional)
If you have a database, add these to Netlify:
- `DATABASE_URL` - Your database connection string

### Build Process
1. `prisma generate` - Generates Prisma client
2. `next build` - Builds Next.js application
3. `npm run db:seed` - Seeds database (optional, won't fail build)

## Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**: Use the build command `npm run build`
3. **Deploy**: Netlify will automatically build and deploy
4. **Test**: Use the hardcoded credentials to test the application

## Troubleshooting

### If Build Still Fails
1. Check Netlify build logs for specific errors
2. Ensure Node.js version is 18.x or higher
3. Verify all dependencies are in `package.json`

### If Authentication Fails
1. Try the hardcoded credentials first
2. Check if database is properly configured
3. Verify environment variables are set

### If Database Features Don't Work
1. The app will fall back to hardcoded data
2. Some features may be limited without database
3. Consider setting up a proper database for full functionality

## Security Note

The hardcoded credentials are for testing purposes only. In production:
- Remove hardcoded credentials
- Use proper authentication providers
- Set up a secure database
- Implement proper security measures

# Course Availability Management Feature

## Overview
This feature allows administrators to control which courses are available for student enrollment. By default, courses are not available for enrollment until an admin explicitly makes them available.

## Database Changes
- Added `isAvailableForEnrollment` field to the `Course` model (defaults to `false`)
- New migration: `20250904050622_add_course_availability`

## API Endpoints

### Admin Endpoints
- `GET /api/admin/courses` - Get all courses with enrollment data
- `PUT /api/admin/courses/[id]/availability` - Update individual course availability
- `PUT /api/admin/courses/bulk-availability` - Bulk update course availability

### Student Endpoints
- `GET /api/courses?available=true` - Get only available courses for enrollment

## Components

### CourseManagement Component
Located at `components/courses/CourseManagement.tsx`

Features:
- View all courses in the system
- View currently available courses
- Toggle individual course availability with switches
- Bulk select and update multiple courses
- Real-time updates with toast notifications

### Updated Pages
- `app/admin/courses/page.tsx` - Admin course management interface
- `app/courses/enroll/page.tsx` - Student enrollment (now only shows available courses)

## Data Service Methods

### New Methods in `lib/data-service.ts`
- `getAllCourses()` - Fetch all courses for admin view
- `getAvailableCourses()` - Fetch only available courses for students
- `updateCourseAvailability(courseId, isAvailable)` - Update individual course
- `bulkUpdateCourseAvailability(courseIds, isAvailable)` - Bulk update courses

## Usage

### For Administrators
1. Navigate to `/admin/courses`
2. View all courses in the system
3. Use individual switches to toggle course availability
4. Use bulk selection to update multiple courses at once
5. See real-time counts of available vs total courses

### For Students
1. Navigate to `/courses/enroll`
2. Only see courses that are marked as available for enrollment
3. Enroll in available courses as before

## Database Seeding
The seed file has been updated to include availability settings:
- CS101 (Introduction to Computer Science): Available
- MATH201 (Advanced Mathematics): Available  
- CS201 (Web Development Fundamentals): Unavailable
- CS301 (Data Structures and Algorithms): Available

## Security
- Only users with `ADMIN` role can access the course management interface
- Only users with `ADMIN` role can update course availability
- Students can only see and enroll in available courses

## Benefits
1. **Controlled Enrollment**: Admins can control which courses are open for enrollment
2. **Seasonal Management**: Easy to open/close courses for different semesters
3. **Capacity Planning**: Can prepare courses before making them available
4. **Bulk Operations**: Efficient management of multiple courses
5. **Real-time Updates**: Immediate feedback on availability changes

# Testing the Admin Course Scheduling Feature

## Prerequisites
1. Make sure the development server is running (`npm run dev`)
2. Have admin credentials ready (admin@example.com / password123)
3. Have some courses in the database (seeded data should be available)

## Test Steps

### 1. Access the Admin Schedule Interface
1. Navigate to `http://localhost:3001`
2. Log in as admin user (admin@example.com / password123)
3. Go to Admin → Courses
4. Click on the "Weekly Schedule" tab

### 2. Test Drag and Drop Functionality
1. **View Unscheduled Courses**: You should see a panel showing courses without schedules
2. **Drag a Course**: Click and drag any course from the unscheduled panel
3. **Drop on Schedule**: Drop it on any time slot in the weekly schedule grid
4. **Enter Room**: A dialog should appear asking for room information
5. **Confirm Schedule**: Enter a room number and click "Schedule Course"

### 3. Verify Schedule Creation
1. **Course Appears**: The course should now appear in the selected time slot
2. **Removed from Unscheduled**: The course should disappear from the unscheduled panel
3. **Available for Enrollment**: The course should now be available for student enrollment

### 4. Test Schedule Removal
1. **Find Scheduled Course**: Locate a scheduled course in the weekly grid
2. **Click X Button**: Click the red X button on the course card
3. **Verify Removal**: The course should disappear from the schedule
4. **Back to Unscheduled**: The course should reappear in the unscheduled panel

### 5. Test Conflict Prevention
1. **Try Double Booking**: Attempt to schedule another course in the same time slot
2. **Error Message**: You should see an error message about the time slot being occupied
3. **No Schedule Created**: The second course should not be scheduled

### 6. Test Student Enrollment
1. **Log in as Student**: Switch to student account (student@example.com / password123)
2. **Check Course Availability**: Go to Courses page
3. **Verify Scheduled Courses**: Scheduled courses should be available for enrollment
4. **Verify Unscheduled Courses**: Unscheduled courses should not be available

## Expected Behavior

### For Administrators:
- ✅ Visual drag and drop interface
- ✅ Immediate feedback on scheduling conflicts
- ✅ Easy schedule removal with X buttons
- ✅ Clear separation between scheduled/unscheduled courses
- ✅ Room assignment dialog
- ✅ Success/error toast notifications

### For Students:
- ✅ Scheduled courses automatically available for enrollment
- ✅ Unscheduled courses not available for enrollment
- ✅ Real-time updates when admin changes schedules

### Database Changes:
- ✅ CourseSchedule records created when courses are scheduled
- ✅ CourseSchedule records deleted when schedules are removed
- ✅ Course.isAvailableForEnrollment automatically toggled
- ✅ No duplicate schedules in same time slot

## Troubleshooting

### If drag and drop doesn't work:
1. Check browser console for JavaScript errors
2. Ensure you're using a modern browser with drag and drop support
3. Try refreshing the page

### If courses don't appear:
1. Check if the database has courses (run seed script if needed)
2. Check browser network tab for API errors
3. Verify the API endpoints are working

### If scheduling fails:
1. Check browser console for error messages
2. Verify the room field is filled in the dialog
3. Check if the time slot is already occupied

## API Endpoints to Test

### PUT /api/admin/courses/[id]/schedule
```bash
curl -X PUT http://localhost:3001/api/admin/courses/course1/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "09:30",
    "room": "CS-101"
  }'
```

### DELETE /api/admin/courses/[id]/schedule
```bash
curl -X DELETE http://localhost:3001/api/admin/courses/course1/schedule
```

## Success Criteria

✅ **Drag and Drop Works**: Courses can be dragged from unscheduled to scheduled
✅ **Schedule Creation**: Courses get proper schedules with room assignments
✅ **Conflict Prevention**: Cannot schedule two courses in same time slot
✅ **Schedule Removal**: Courses can be removed from schedule
✅ **Auto Availability**: Scheduled courses become available for enrollment
✅ **Auto Unavailability**: Unscheduled courses become unavailable
✅ **Real-time Updates**: Changes reflect immediately across the system
✅ **Error Handling**: Proper error messages for conflicts and failures
✅ **UI Feedback**: Toast notifications for success/error states

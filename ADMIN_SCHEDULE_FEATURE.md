# Admin Course Scheduling Feature

## Overview

The admin course scheduling feature allows administrators to drag and drop courses onto a weekly schedule, making them available for student enrollment. This feature provides a visual interface for managing course schedules and ensures that scheduled courses are automatically made available for enrollment.

## Features

### 1. Drag and Drop Interface
- **Unscheduled Courses Panel**: Shows all courses that don't have a schedule yet
- **Weekly Schedule Grid**: Visual representation of the week with time slots
- **Drag and Drop**: Drag courses from the unscheduled panel to any time slot

### 2. Schedule Management
- **Time Slots**: Predefined time slots throughout the day (8:00-9:30, 9:40-11:10, etc.)
- **Room Assignment**: Specify room numbers when scheduling courses
- **Conflict Prevention**: Prevents scheduling conflicts in the same time slot
- **Schedule Removal**: Remove schedules by clicking the X button on scheduled courses

### 3. Automatic Enrollment Availability
- **Auto-Enable**: Courses become available for enrollment when scheduled
- **Auto-Disable**: Courses become unavailable when schedules are removed
- **Real-time Updates**: Changes are reflected immediately in the student enrollment interface

## How to Use

### Accessing the Feature
1. Log in as an admin user
2. Navigate to Admin → Courses
3. Click on the "Weekly Schedule" tab

### Scheduling a Course
1. Find the course in the "Unscheduled Courses" panel
2. Drag the course card to the desired time slot and day
3. Enter the room number in the dialog that appears
4. Click "Schedule Course" to confirm

### Removing a Schedule
1. Find the scheduled course in the weekly grid
2. Click the X button on the course card
3. The course will be moved back to the unscheduled panel

## Technical Implementation

### Components
- `AdminWeeklySchedule.tsx`: Main component for the drag and drop interface
- `CourseManagement.tsx`: Existing component for course availability management

### API Endpoints
- `PUT /api/admin/courses/[id]/schedule`: Create or update course schedule
- `DELETE /api/admin/courses/[id]/schedule`: Remove course schedule

### Data Service Methods
- `updateCourseSchedule()`: Update course schedule
- `removeCourseSchedule()`: Remove course schedule
- `getAllCourses()`: Fetch all courses with schedule information

### Database Schema
The feature uses the existing `CourseSchedule` model:
```prisma
model CourseSchedule {
  id        String @id @default(cuid())
  courseId  String @unique
  dayOfWeek Int    // 0 = Sunday, 1 = Monday, etc.
  startTime String // Format: "HH:MM"
  endTime   String // Format: "HH:MM"
  room      String?
  
  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

## User Experience

### For Administrators
- Visual drag and drop interface
- Immediate feedback on scheduling conflicts
- Easy schedule management
- Clear separation between scheduled and unscheduled courses

### For Students
- Scheduled courses automatically appear in the enrollment interface
- Real-time availability updates
- Clear schedule information in the weekly view

## Benefits

1. **Streamlined Workflow**: No need to manually toggle course availability
2. **Visual Management**: Intuitive drag and drop interface
3. **Conflict Prevention**: Automatic detection of scheduling conflicts
4. **Real-time Updates**: Changes are immediately reflected across the system
5. **Consistent Data**: Schedule and availability are always in sync

## Future Enhancements

- Custom time slot creation
- Recurring schedule patterns
- Room capacity management
- Schedule templates
- Bulk scheduling operations
- Schedule export/import functionality

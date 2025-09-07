'use client';

import React, { useState, useEffect } from 'react';
import { Course, CourseSchedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, MapPin, Users, BookOpen, X } from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { toast } from '@/hooks/use-toast';

interface AdminWeeklyScheduleProps {
  className?: string;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const TIME_SLOTS = [
  { start: '08:00', end: '09:30' },
  { start: '09:40', end: '11:10' },
  { start: '11:40', end: '13:10' },
  { start: '13:20', end: '14:50' },
  { start: '15:00', end: '16:30' },
  { start: '16:40', end: '18:10' }
];

export function AdminWeeklySchedule({ className }: AdminWeeklyScheduleProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null);
  const [scheduleDialog, setScheduleDialog] = useState<{
    isOpen: boolean;
    course: Course | null;
    dayOfWeek: number;
    timeSlot: { start: string; end: string };
    room: string;
  }>({
    isOpen: false,
    course: null,
    dayOfWeek: 0,
    timeSlot: { start: '', end: '' },
    room: ''
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const allCoursesData = await DataService.getAllCourses();
      const scheduledCourses = allCoursesData.filter(course => isCourseScheduled(course));
      
      setCourses(scheduledCourses);
      setAllCourses(allCoursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, course: Course) => {
    setDraggedCourse(course);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dayOfWeek: number, timeSlot: { start: string; end: string }) => {
    e.preventDefault();
    if (!draggedCourse) return;

    // Check if this specific course is already scheduled for this time slot
    const isCourseAlreadyScheduled = draggedCourse.schedules?.some(schedule => 
      schedule.dayOfWeek === dayOfWeek && 
      schedule.startTime === timeSlot.start &&
      schedule.endTime === timeSlot.end
    );

    if (isCourseAlreadyScheduled) {
      toast({
        title: 'Course already scheduled',
        description: `${draggedCourse.title} is already scheduled for this time slot`,
        variant: 'destructive',
      });
      return;
    }

    setScheduleDialog({
      isOpen: true,
      course: draggedCourse,
      dayOfWeek,
      timeSlot,
      room: ''
    });
    setDraggedCourse(null);
  };

  const handleScheduleCourse = async () => {
    if (!scheduleDialog.course || !scheduleDialog.room.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room number',
        variant: 'destructive',
      });
      return;
    }

    console.log('Scheduling course:', {
      courseId: scheduleDialog.course.id,
      courseTitle: scheduleDialog.course.title,
      schedule: {
        dayOfWeek: scheduleDialog.dayOfWeek,
        startTime: scheduleDialog.timeSlot.start,
        endTime: scheduleDialog.timeSlot.end,
        room: scheduleDialog.room.trim()
      }
    });

    try {
      const success = await DataService.updateCourseSchedule(
        scheduleDialog.course.id,
        {
          dayOfWeek: scheduleDialog.dayOfWeek,
          startTime: scheduleDialog.timeSlot.start,
          endTime: scheduleDialog.timeSlot.end,
          room: scheduleDialog.room.trim()
        }
      );

      if (success) {
        await loadCourses(); // Reload to get updated data
        setScheduleDialog({ isOpen: false, course: null, dayOfWeek: 0, timeSlot: { start: '', end: '' }, room: '' });
        toast({
          title: 'Success',
          description: `${scheduleDialog.course.title} has been scheduled`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to schedule course',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error scheduling course:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule course',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveSchedule = async (courseId: string) => {
    try {
      const success = await DataService.removeCourseSchedule(courseId);
      if (success) {
        await loadCourses(); // Reload to get updated data
        toast({
          title: 'Success',
          description: 'Course schedule has been removed',
        });
      }
    } catch (error) {
      console.error('Error removing schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove schedule',
        variant: 'destructive',
      });
    }
  };

  const isCourseScheduled = (course: Course): boolean => {
    return !!(course.schedules && course.schedules.length > 0);
  };

  const getCoursesForTimeSlot = (day: number, timeSlot: { start: string; end: string }) => {
    return courses.filter(course => {
      if (!course.schedules) return false;
      return course.schedules.some(schedule => 
        schedule.dayOfWeek === day && 
        schedule.startTime === timeSlot.start &&
        schedule.endTime === timeSlot.end
      );
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Weekly Schedule */}

      <Card className="min-h-[800px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Weekly Schedule
            <Badge variant="secondary" className="ml-2">
              {allCourses.length} total courses
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag courses from the sidebar to schedule them. Click the X to remove a schedule.
          </p>
        </CardHeader>
        <CardContent className="p-0 h-[700px]">
          <div className="flex h-full">
            {/* Course Sidebar */}
            <div className="w-80 p-4 border-r bg-gray-50 dark:bg-gray-800 flex-shrink-0">
              <h3 className="font-medium mb-3">All Courses</h3>
              <div className="space-y-2 h-[600px] overflow-y-auto">
                {allCourses.map((course) => (
                  <div
                    key={course.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, course)}
                    className={`p-3 border rounded-lg cursor-move hover:shadow-md transition-shadow text-sm ${
                      isCourseScheduled(course)
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-xs">{course.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {course.instructor.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{course.enrolledStudents.length}/{course.capacity || 0}</span>
                          <BookOpen className="w-3 h-3" />
                          <span>{course.credits} credits</span>
                        </div>
                        {isCourseScheduled(course) && (
                          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                            ✓ Scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full h-full">
                <thead>
                  <tr className="border-b h-16">
                    <th className="w-32 p-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Period</th>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <th key={day} className="w-48 p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((timeSlot) => (
                    <tr key={timeSlot.start} className="border-b last:border-b-0 h-32">
                      <td className="p-3 text-sm font-medium text-gray-500 dark:text-gray-400 w-32">
                        <div className="text-center">
                          <div className="font-semibold">{timeSlot.start}</div>
                          <div className="text-xs opacity-75">{timeSlot.end}</div>
                        </div>
                      </td>
                      {DAYS_OF_WEEK.map((_, dayIndex) => {
                        const coursesInSlot = getCoursesForTimeSlot(dayIndex, timeSlot);
                        return (
                          <td 
                            key={dayIndex} 
                            className="p-2 align-top h-32 w-48 border-l relative"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, dayIndex, timeSlot)}
                          >
                            <div className="space-y-1 h-full">
                              {coursesInSlot.map((course) => (
                                <div
                                  key={course.id}
                                  className="p-1.5 rounded border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium truncate leading-tight">
                                        {course.title}
                                      </div>
                                      <div className="text-xs opacity-75 truncate leading-tight">
                                        {course.schedules?.find(s => 
                                          s.dayOfWeek === dayIndex && 
                                          s.startTime === timeSlot.start && 
                                          s.endTime === timeSlot.end
                                        )?.room} • {course.classNumber}
                                      </div>
                                      <div className="text-xs opacity-75 mt-0.5">
                                        {course.enrolledStudents.length}/{course.capacity || 0}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveSchedule(course.id)}
                                      className="text-red-500 hover:text-red-700 p-0.5"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {coursesInSlot.length === 0 && (
                                <div className="h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                                  <span className="text-xs text-gray-400">Drop course here</span>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog.isOpen} onOpenChange={(open) => setScheduleDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Course</DialogTitle>
          </DialogHeader>
          {scheduleDialog.course && (
            <div className="space-y-4">
              <div>
                <Label>Course</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <h3 className="font-medium">{scheduleDialog.course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {scheduleDialog.course.instructor.name}
                  </p>
                </div>
              </div>
              <div>
                <Label>Time</Label>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  {DAYS_OF_WEEK[scheduleDialog.dayOfWeek]} • {scheduleDialog.timeSlot.start} - {scheduleDialog.timeSlot.end}
                </div>
              </div>
              <div>
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  placeholder="e.g., CS-101, Room 201"
                  value={scheduleDialog.room}
                  onChange={(e) => setScheduleDialog(prev => ({ ...prev, room: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleScheduleCourse();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setScheduleDialog({ isOpen: false, course: null, dayOfWeek: 0, timeSlot: { start: '', end: '' }, room: '' })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleCourse}
                >
                  Schedule Course
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

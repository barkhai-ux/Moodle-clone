'use client';

import React, { useState } from 'react';
import { Course, CourseSchedule } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Users, BookOpen } from 'lucide-react';
import { CourseEnrollmentDialog } from './CourseEnrollmentDialog';

interface WeeklyScheduleProps {
  courses: Course[];
  enrolledCourseIds: string[];
  onEnrollmentChange: (courseId: string, action: 'enroll' | 'drop') => void;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const TIME_SLOTS = [
  { start: '08:00', end: '09:30' },
  { start: '09:40', end: '11:10' },
  { start: '11:40', end: '13:10' },
  { start: '13:20', end: '14:50' }
];

export function WeeklySchedule({ courses, enrolledCourseIds, onEnrollmentChange }: WeeklyScheduleProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDialogOpen(true);
  };

  const handleEnrollmentAction = (courseId: string, action: 'enroll' | 'drop') => {
    onEnrollmentChange(courseId, action);
    setIsDialogOpen(false);
    setSelectedCourse(null);
  };

  const getCoursesForTimeSlot = (day: number, timeSlot: { start: string; end: string }) => {
    return courses.filter(course => {
      if (!course.schedules || course.schedules.length === 0) return false;
      return course.schedules.some(schedule => 
        schedule.dayOfWeek === day && 
        schedule.startTime === timeSlot.start &&
        schedule.endTime === timeSlot.end
      );
    });
  };

  const getCourseStatus = (course: Course) => {
    if (enrolledCourseIds.includes(course.id)) {
      return 'enrolled';
    }
    if (course.enrolledStudents.length >= (course.capacity || 0)) {
      return 'full';
    }
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200';
      case 'full':
        return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">University Schedule</h2>
          <p className="text-gray-600 dark:text-gray-300">Click on courses to view details and enroll</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Enrolled
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Available
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Full
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="w-24 p-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Period</th>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <th key={day} className="w-32 p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot.start} className="border-b last:border-b-0">
                    <td className="p-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <div className="font-semibold">{timeSlot.start}</div>
                        <div className="text-xs opacity-75">{timeSlot.end}</div>
                      </div>
                    </td>
                    {DAYS_OF_WEEK.map((_, dayIndex) => {
                      const coursesInSlot = getCoursesForTimeSlot(dayIndex, timeSlot);
                      return (
                        <td key={dayIndex} className="p-1 align-top min-h-[100px]">
                          <div className="space-y-1">
                            {coursesInSlot.map((course) => {
                              const status = getCourseStatus(course);
                              return (
                                <div
                                  key={course.id}
                                  className={`p-1.5 rounded border cursor-pointer transition-all hover:shadow-sm ${getStatusColor(status)}`}
                                  onClick={() => handleCourseClick(course)}
                                >
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
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <CourseEnrollmentDialog
          course={selectedCourse}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedCourse(null);
          }}
          onEnrollmentAction={handleEnrollmentAction}
          isEnrolled={enrolledCourseIds.includes(selectedCourse.id)}
        />
      )}
    </div>
  );
}

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
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
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

  const getCoursesForTimeSlot = (day: number, timeSlot: string) => {
    return courses.filter(course => {
      if (!course.schedule) return false;
      return course.schedule.dayOfWeek === day && 
             course.schedule.startTime === timeSlot;
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
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
                  <th className="w-20 p-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
                  {DAYS_OF_WEEK.map((day, index) => (
                    <th key={day} className="w-32 p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot} className="border-b last:border-b-0">
                    <td className="p-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {timeSlot}
                    </td>
                    {DAYS_OF_WEEK.map((_, dayIndex) => {
                      const coursesInSlot = getCoursesForTimeSlot(dayIndex, timeSlot);
                      return (
                        <td key={dayIndex} className="p-2 align-top">
                          <div className="space-y-1">
                            {coursesInSlot.map((course) => {
                              const status = getCourseStatus(course);
                              return (
                                <div
                                  key={course.id}
                                  className={`p-2 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getStatusColor(status)}`}
                                  onClick={() => handleCourseClick(course)}
                                >
                                  <div className="text-xs font-medium truncate">
                                    {course.title}
                                  </div>
                                  <div className="text-xs opacity-75 truncate">
                                    {course.schedule?.room}
                                  </div>
                                  <div className="flex items-center justify-between mt-1">
                                    <div className="text-xs">
                                      {course.schedule?.startTime} - {course.schedule?.endTime}
                                    </div>
                                    <div className="text-xs">
                                      {course.enrolledStudents.length}/{course.capacity || 0}
                                    </div>
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

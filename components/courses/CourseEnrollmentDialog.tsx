'use client';

import React from 'react';
import { Course } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface CourseEnrollmentDialogProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onEnrollmentAction: (courseId: string, action: 'enroll' | 'drop') => void;
  isEnrolled: boolean;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export function CourseEnrollmentDialog({
  course,
  isOpen,
  onClose,
  onEnrollmentAction,
  isEnrolled
}: CourseEnrollmentDialogProps) {
  const isFull = course.enrolledStudents.length >= (course.capacity || 0);
  const canEnroll = !isEnrolled && !isFull;

  const handleEnroll = () => {
    onEnrollmentAction(course.id, 'enroll');
  };

  const handleDrop = () => {
    onEnrollmentAction(course.id, 'drop');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {course.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            {course.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Image */}
          {course.coverImage && (
            <div className="relative h-48 w-full rounded-lg overflow-hidden">
              <img
                src={course.coverImage}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Course Status */}
          <div className="flex items-center space-x-2">
            {isEnrolled ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enrolled
              </Badge>
            ) : isFull ? (
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                Full
              </Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Available
              </Badge>
            )}
            <Badge variant="outline">
              {course.credits} Credits
            </Badge>
          </div>

          {/* Course Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Schedule Information */}
            {course.schedule && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Schedule</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {DAYS_OF_WEEK[course.schedule.dayOfWeek]} • {formatTime(course.schedule.startTime)} - {formatTime(course.schedule.endTime)}
                      </span>
                    </div>
                    {course.schedule.room && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {course.schedule.room}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enrollment Information */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Enrollment</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Enrolled:</span>
                    <span className="font-medium">{course.enrolledStudents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Capacity:</span>
                    <span className="font-medium">{course.capacity || 'Unlimited'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, ((course.enrolledStudents.length / (course.capacity || 1)) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructor Information */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Instructor</h3>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {course.instructor.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {course.instructor.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Prerequisites</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {course.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {isEnrolled ? (
              <Button 
                variant="destructive" 
                onClick={handleDrop}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Drop Course
              </Button>
            ) : canEnroll ? (
              <Button 
                onClick={handleEnroll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Enroll in Course
              </Button>
            ) : (
              <Button disabled variant="outline">
                {isFull ? 'Course Full' : 'Cannot Enroll'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

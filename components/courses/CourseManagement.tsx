'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { DataService } from '@/lib/data-service';
import { Course } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CourseManagementProps {
  className?: string;
}

export function CourseManagement({ className }: CourseManagementProps) {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const [all, available] = await Promise.all([
        DataService.getAllCourses(),
        DataService.getAvailableCourses(),
      ]);
      setAllCourses(all);
      setAvailableCourses(available);
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

  const handleToggleAvailability = async (courseId: string, isAvailable: boolean) => {
    setUpdating(true);
    try {
      const updatedCourse = await DataService.updateCourseAvailability(courseId, isAvailable);
      if (updatedCourse) {
        await loadCourses(); // Reload to get updated data
        toast({
          title: 'Success',
          description: `Course ${isAvailable ? 'made available' : 'made unavailable'} for enrollment`,
        });
      }
    } catch (error) {
      console.error('Error updating course availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course availability',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkUpdate = async (isAvailable: boolean) => {
    if (selectedCourses.length === 0) {
      toast({
        title: 'No courses selected',
        description: 'Please select courses to update',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      const success = await DataService.bulkUpdateCourseAvailability(selectedCourses, isAvailable);
      if (success) {
        await loadCourses(); // Reload to get updated data
        setSelectedCourses([]); // Clear selection
        toast({
          title: 'Success',
          description: `${selectedCourses.length} course(s) ${isAvailable ? 'made available' : 'made unavailable'} for enrollment`,
        });
      }
    } catch (error) {
      console.error('Error bulk updating courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to update courses',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(allCourses.map(course => course.id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseId]);
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    }
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
      {/* Available Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Available Courses for Enrollment
            <Badge variant="secondary" className="ml-2">
              {availableCourses.length} courses
            </Badge>
          </CardTitle>
          <CardDescription>
            These courses are currently available for student enrollment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No courses are currently available for enrollment</p>
          ) : (
            <div className="space-y-4">
              {availableCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Instructor: {course.instructor.name}</span>
                      <span>Students: {course.enrolledStudents?.length || 0}</span>
                      <span>Credits: {course.credits}</span>
                    </div>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) => handleToggleAvailability(course.id, checked)}
                    disabled={updating}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* All Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            All Courses
            <Badge variant="secondary" className="ml-2">
              {allCourses.length} total courses
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage which courses are available for student enrollment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={selectedCourses.length === allCourses.length && allCourses.length > 0}
                onCheckedChange={handleSelectAll}
                disabled={updating}
              />
              <span className="text-sm text-gray-600">
                {selectedCourses.length} of {allCourses.length} courses selected
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate(true)}
                disabled={selectedCourses.length === 0 || updating}
              >
                Make Available
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkUpdate(false)}
                disabled={selectedCourses.length === 0 || updating}
              >
                Make Unavailable
              </Button>
            </div>
          </div>

          {/* Course List */}
          <div className="space-y-4">
            {allCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={(checked) => handleSelectCourse(course.id, !!checked)}
                    disabled={updating}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Instructor: {course.instructor.name}</span>
                      <span>Students: {course.enrolledStudents?.length || 0}</span>
                      <span>Credits: {course.credits}</span>
                      <Badge variant={course.isAvailableForEnrollment ? "default" : "secondary"}>
                        {course.isAvailableForEnrollment ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={course.isAvailableForEnrollment || false}
                  onCheckedChange={(checked) => handleToggleAvailability(course.id, checked)}
                  disabled={updating}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

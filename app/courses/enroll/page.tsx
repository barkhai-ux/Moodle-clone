'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { WeeklySchedule } from '@/components/courses/WeeklySchedule';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/data-service';
import { useToast } from '@/hooks/use-toast';
import { Course } from '@/types';

export default function CourseEnrollmentPage() {
  const { user, enrolledCourses, enrollInCourse, dropCourse } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all courses (both available and enrolled)
        const [availableCourses, enrolledCoursesData] = await Promise.all([
          DataService.getAvailableCourses(),
          DataService.getCourses({ studentId: user?.id })
        ]);
        
        // Combine available courses with enrolled courses, avoiding duplicates
        const allCourses = [...availableCourses];
        enrolledCoursesData.forEach(enrolledCourse => {
          if (!allCourses.find(course => course.id === enrolledCourse.id)) {
            allCourses.push(enrolledCourse);
          }
        });
        
        setCourses(allCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleEnrollmentChange = (courseId: string, action: 'enroll' | 'drop') => {
    if (action === 'enroll') {
      enrollInCourse(courseId);
      toast({
        title: "Successfully enrolled!",
        description: "You have been enrolled in the course.",
      });
    } else {
      dropCourse(courseId);
      toast({
        title: "Course dropped",
        description: "You have been dropped from the course.",
      });
    }
  };

  // Only students should access this page
  if (user?.role !== 'STUDENT') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="courses" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300">Only students can access course enrollment.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="courses" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading courses...</p>
          </div>
        ) : (
          <WeeklySchedule
            courses={courses}
            enrolledCourseIds={enrolledCourses}
            onEnrollmentChange={handleEnrollmentChange}
          />
        )}
      </main>
    </div>
  );
}

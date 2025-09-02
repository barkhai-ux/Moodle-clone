'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { AssignmentList } from '@/components/assignments/AssignmentList';
import { DataService } from '@/lib/data-service';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment, Course } from '@/types';

export default function AssignmentsPage() {
  const { user, enrolledCourses } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedAssignments: Assignment[] = [];
        let fetchedCourses: Course[] = [];

        if (user?.role === 'STUDENT') {
          // For students, only fetch assignments from enrolled courses
          const [allAssignments, allCourses] = await Promise.all([
            DataService.getAssignments(),
            DataService.getCourses({ studentId: user.id })
          ]);
          
          // Filter assignments to only show those from enrolled courses
          fetchedAssignments = allAssignments.filter(assignment => 
            enrolledCourses.includes(assignment.courseId)
          );
          fetchedCourses = allCourses;
        } else if (user?.role === 'TEACHER') {
          // For teachers, fetch assignments from their courses
          const [allAssignments, allCourses] = await Promise.all([
            DataService.getAssignments({ instructorId: user.id }),
            DataService.getCourses({ instructorId: user.id })
          ]);
          fetchedAssignments = allAssignments;
          fetchedCourses = allCourses;
        } else {
          // For other roles or no user, fetch all assignments
          const [allAssignments, allCourses] = await Promise.all([
            DataService.getAssignments(),
            DataService.getCourses()
          ]);
          fetchedAssignments = allAssignments;
          fetchedCourses = allCourses;
        }

        setAssignments(fetchedAssignments);
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, enrolledCourses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="assignments" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading assignments...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="assignments" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AssignmentList assignments={assignments} courses={courses} />
      </main>
    </div>
  );
}
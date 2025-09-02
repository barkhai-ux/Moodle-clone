'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { GradeTable } from '@/components/grades/GradeTable';
import { DataService } from '@/lib/data-service';
import { useAuth } from '@/contexts/AuthContext';
import { Grade, Assignment, Course } from '@/types';

export default function GradesPage() {
  const { user, enrolledCourses } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let fetchedGrades: Grade[] = [];
        let fetchedAssignments: Assignment[] = [];
        let fetchedCourses: Course[] = [];

        if (user?.role === 'STUDENT') {
          // For students, only fetch grades and assignments from enrolled courses
          const [allGrades, allAssignments, allCourses] = await Promise.all([
            DataService.getGrades({ studentId: user.id }),
            DataService.getAssignments(),
            DataService.getCourses({ studentId: user.id })
          ]);
          
          // Filter assignments to only show those from enrolled courses
          fetchedAssignments = allAssignments.filter(assignment => 
            enrolledCourses.includes(assignment.courseId)
          );
          fetchedGrades = allGrades;
          fetchedCourses = allCourses;
        } else if (user?.role === 'TEACHER') {
          // For teachers, fetch grades and assignments from their courses
          const [allGrades, allAssignments, allCourses] = await Promise.all([
            DataService.getGrades(),
            DataService.getAssignments({ instructorId: user.id }),
            DataService.getCourses({ instructorId: user.id })
          ]);
          fetchedGrades = allGrades;
          fetchedAssignments = allAssignments;
          fetchedCourses = allCourses;
        } else {
          // For other roles or no user, fetch all data
          const [allGrades, allAssignments, allCourses] = await Promise.all([
            DataService.getGrades(),
            DataService.getAssignments(),
            DataService.getCourses()
          ]);
          fetchedGrades = allGrades;
          fetchedAssignments = allAssignments;
          fetchedCourses = allCourses;
        }

        setGrades(fetchedGrades);
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
        <Navigation currentPage="grades" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading grades...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="grades" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Grades</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your academic performance and progress</p>
        </div>
        
        <GradeTable 
          grades={grades} 
          assignments={assignments} 
          courses={courses} 
        />
      </main>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { DegreeAudit } from '@/components/degree/DegreeAudit';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/data-service';
import { DegreeProgram, Course } from '@/types';

export default function DegreeAuditPage() {
  const { user, enrolledCourses } = useAuth();
  const [degreeProgram, setDegreeProgram] = useState<DegreeProgram | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Only students should access this page
  if (user?.role !== 'STUDENT') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="degree-audit" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300">Only students can access degree audit.</p>
          </div>
        </main>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCourses] = await Promise.all([
          DataService.getCourses()
        ]);
        
        setCourses(fetchedCourses);
        
        // For now, we'll create a mock degree program
        // In a real app, you'd have a separate API for degree programs
        const mockDegreeProgram: DegreeProgram = {
          id: 'cs-bachelor',
          name: 'Bachelor of Science in Computer Science',
          totalCreditsRequired: 120,
          description: 'A comprehensive program covering computer science fundamentals, programming, algorithms, and software engineering.',
          requirements: [
            {
              id: 'core-cs',
              category: 'core',
              categoryName: 'Core Computer Science',
              requiredCredits: 30,
              completedCredits: 6,
              courses: ['course1', 'course2', 'course3', 'course5'],
              description: 'Fundamental computer science courses covering programming, algorithms, and data structures.'
            },
            {
              id: 'electives',
              category: 'electives',
              categoryName: 'CS Electives',
              requiredCredits: 15,
              completedCredits: 0,
              courses: ['course4', 'course6', 'course7', 'course8'],
              description: 'Advanced and specialized computer science courses.'
            }
          ]
        };
        
        setDegreeProgram(mockDegreeProgram);
      } catch (error) {
        console.error('Error fetching degree audit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="degree-audit" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading degree audit...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!degreeProgram) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="degree-audit" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Degree Program Found</h1>
            <p className="text-gray-600 dark:text-gray-300">Please contact your academic advisor to set up your degree program.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="degree-audit" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Degree Audit</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress toward graduation and degree requirements
              </p>
            </div>
          </div>

          {/* Degree Audit Component */}
          <DegreeAudit
            degreeProgram={degreeProgram}
            enrolledCourses={enrolledCourses}
            allCourses={courses}
          />
        </div>
      </main>
    </div>
  );
}


'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { AdminWeeklySchedule } from '@/components/courses/AdminWeeklySchedule';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminCoursesPage() {
  const { user } = useAuth();

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="courses" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300">Only administrators can access course management.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="courses" />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Scheduling</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Schedule all courses in the weekly timetable
            </p>
          </div>

          <AdminWeeklySchedule className="w-full" />
        </div>
      </main>
    </div>
  );
}

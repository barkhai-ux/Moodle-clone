'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
}
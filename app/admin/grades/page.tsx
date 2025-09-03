'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminGradesPage() {
  const { user } = useAuth();

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="grades" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300">Only administrators can access grade management.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="grades" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grade Management</h1>
              <p className="text-gray-600 dark:text-gray-300">
                View and manage all student grades
              </p>
            </div>
            <Button>Download All Grades</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Grades</CardTitle>
              <CardDescription>View and edit student grades across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Grade management interface will be implemented here.</p>
                <p>Features will include:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>View all student grades across all courses</li>
                  <li>Edit individual grades</li>
                  <li>Bulk grade updates</li>
                  <li>Export grades to CSV/Excel</li>
                  <li>Grade analytics and statistics</li>
                  <li>Search and filter grades by student, course, or assignment</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDegreeAuditPage() {
  const { user } = useAuth();

  // Check if user is admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="degree-audit" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300">Only administrators can access degree audit management.</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Degree Audit Management</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage degree programs and requirements
              </p>
            </div>
            <Button>Add Degree Program</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Degree Programs</CardTitle>
              <CardDescription>Manage degree programs and their requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Degree program management interface will be implemented here.</p>
                <p>Features will include:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Create and edit degree programs</li>
                  <li>Add or modify degree requirements</li>
                  <li>Set credit requirements for different categories</li>
                  <li>Assign courses to degree requirements</li>
                  <li>View student progress through degree programs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { StudentSidebar } from '@/components/layout/StudentSidebar';

interface StudentShellProps {
  children: React.ReactNode;
}

export function StudentShell({ children }: StudentShellProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Determine current page key for sidebar highlighting
  const getKeyFromPath = () => {
    if (!pathname) return undefined;
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname.startsWith('/courses/enroll')) return 'enroll';
    if (pathname.startsWith('/courses')) return 'courses';
    if (pathname.startsWith('/degree-audit')) return 'degree-audit';
    if (pathname.startsWith('/assignments')) return 'assignments';
    if (pathname.startsWith('/grades')) return 'grades';
    if (pathname.startsWith('/chat')) return 'chat';
    return undefined;
  };

  const currentKey = getKeyFromPath();

  // If not student, render children unchanged
  if (!user || user.role !== 'STUDENT') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <StudentSidebar currentPage={currentKey} />
      <div className="md:pl-72 lg:pl-80">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}



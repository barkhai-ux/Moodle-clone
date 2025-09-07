'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationBadge } from '@/components/ui/notification-badge';
import {
  Home,
  BookOpen,
  ClipboardList,
  BarChart3,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface StudentSidebarProps {
  currentPage?: string;
}

export function StudentSidebar({ currentPage }: StudentSidebarProps) {
  const { user } = useAuth();
  const { totalUnreadCount } = useNotifications();
  const { t } = useI18n();

  if (!user) return null;

  const items = [
    { href: '/dashboard', icon: Home, label: t('nav.dashboard', 'Dashboard'), key: 'dashboard' },
    { href: '/courses', icon: BookOpen, label: t('nav.courses', 'My Courses'), key: 'courses' },
    { href: '/courses/enroll', icon: BookOpen, label: t('nav.enroll', 'Enroll'), key: 'enroll' },
    { href: '/degree-audit', icon: FileText, label: t('nav.degreeAudit', 'Degree Audit'), key: 'degree-audit' },
    { href: '/assignments', icon: ClipboardList, label: t('nav.assignments', 'Assignments'), key: 'assignments' },
    { href: '/grades', icon: BarChart3, label: t('nav.grades', 'My Grades'), key: 'grades' },
    { href: '/chat', icon: MessageSquare, label: t('nav.chat', 'Chat'), key: 'chat' },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 lg:w-72 flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-opacity-90 border-r border-gray-200 dark:border-gray-800 py-4 z-30">
      <nav className="px-3 space-y-1">
        {items.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:ring-teal-800'
                  : 'text-gray-700 hover:bg-gray-100/60 dark:text-gray-300 dark:hover:bg-gray-800/70'
              }`}
            >
              <span className="flex items-center space-x-2">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </span>
              {item.key === 'chat' && totalUnreadCount > 0 && (
                <NotificationBadge count={totalUnreadCount} size="sm" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}



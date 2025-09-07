'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBadge } from '@/components/ui/notification-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  Home,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Users,
  ClipboardList,
  FileText,
  User,
  Briefcase,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useI18n } from '@/contexts/I18nContext';

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const { user, logout } = useAuth();
  const { totalUnreadCount } = useNotifications();
  const { t } = useI18n();

  if (!user) return null;

  const adminNavItems = [
    { href: '/dashboard', icon: Home, label: t('nav.dashboard', 'Dashboard'), key: 'dashboard' },
    { href: '/admin/degree-audit', icon: FileText, label: t('nav.degreeAudit', 'Degree Audit'), key: 'degree-audit' },
    { href: '/admin/users', icon: Users, label: t('nav.users', 'All Users'), key: 'users' },
    { href: '/admin/courses', icon: BookOpen, label: t('nav.courses', 'All Courses'), key: 'courses' },
    { href: '/admin/grades', icon: BarChart3, label: t('nav.grades', 'All Grades'), key: 'grades' },
  ];

  const teacherNavItems = [
    { href: '/dashboard', icon: Home, label: t('nav.dashboard', 'Dashboard'), key: 'dashboard' },
    { href: '/courses', icon: BookOpen, label: t('nav.courses', 'My Courses'), key: 'courses' },
    { href: '/students', icon: Users, label: t('nav.students', 'Students'), key: 'students' },
    { href: '/assignments', icon: ClipboardList, label: t('nav.assignments', 'Assignments'), key: 'assignments' },
    { href: '/grades', icon: BarChart3, label: t('nav.grades', 'Grades'), key: 'grades' },
    { href: '/chat', icon: MessageSquare, label: t('nav.chat', 'Chat'), key: 'chat' },
  ];

  const studentNavItems = [
    { href: '/dashboard', icon: Home, label: t('nav.dashboard', 'Dashboard'), key: 'dashboard' },
    { href: '/courses', icon: BookOpen, label: t('nav.courses', 'My Courses'), key: 'courses' },
    { href: '/courses/enroll', icon: BookOpen, label: t('nav.enroll', 'Enroll'), key: 'enroll' },
    { href: '/degree-audit', icon: FileText, label: t('nav.degreeAudit', 'Degree Audit'), key: 'degree-audit' },
    { href: '/assignments', icon: ClipboardList, label: t('nav.assignments', 'Assignments'), key: 'assignments' },
    { href: '/grades', icon: BarChart3, label: t('nav.grades', 'My Grades'), key: 'grades' },
    { href: '/chat', icon: MessageSquare, label: t('nav.chat', 'Chat'), key: 'chat' },
  ];

  const getNavItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return adminNavItems;
      case 'TEACHER':
        return teacherNavItems;
      case 'STUDENT':
      default:
        return studentNavItems;
    }
  };

  const getThemeColor = () => {
    switch (user.role) {
      case 'ADMIN':
        return 'bg-red-600 dark:bg-red-700';
      case 'TEACHER':
        return 'bg-blue-600 dark:bg-blue-700';
      case 'STUDENT':
      default:
        return 'bg-teal-600 dark:bg-teal-700';
    }
  };

  const navItems = getNavItems();
  const themeColor = getThemeColor();

  return (
    <nav className={`${themeColor} text-white/95 backdrop-blur supports-[backdrop-filter]:bg-opacity-90 shadow-lg dark:shadow-gray-900/20 fixed top-0 left-0 right-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8" />
              <span className="text-xl font-bold">EduPortal</span>
            </Link>
            
            {user.role !== 'STUDENT' && (
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => {
                  const isActive = currentPage === item.key;
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative ${
                        isActive
                          ? 'bg-white/20'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.key === 'chat' && totalUnreadCount > 0 && (
                        <NotificationBadge count={totalUnreadCount} size="sm" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <LanguageToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {user.role === 'STUDENT' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/portfolio" className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Portfolio</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
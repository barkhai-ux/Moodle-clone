'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavigationProps {
  currentPage?: string;
}

export function Navigation({ currentPage }: NavigationProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const adminNavItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', key: 'dashboard' },
    { href: '/admin/degree-audit', icon: FileText, label: 'Degree Audit', key: 'degree-audit' },
    { href: '/admin/users', icon: Users, label: 'All Users', key: 'users' },
    { href: '/admin/courses', icon: BookOpen, label: 'All Courses', key: 'courses' },
    { href: '/admin/grades', icon: BarChart3, label: 'All Grades', key: 'grades' },
  ];

  const teacherNavItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', key: 'dashboard' },
    { href: '/courses', icon: BookOpen, label: 'My Courses', key: 'courses' },
    { href: '/students', icon: Users, label: 'Students', key: 'students' },
    { href: '/assignments', icon: ClipboardList, label: 'Assignments', key: 'assignments' },
    { href: '/grades', icon: BarChart3, label: 'Grades', key: 'grades' },
  ];

  const studentNavItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', key: 'dashboard' },
    { href: '/courses', icon: BookOpen, label: 'My Courses', key: 'courses' },
    { href: '/courses/enroll', icon: BookOpen, label: 'Enroll in Courses', key: 'enroll' },
    { href: '/degree-audit', icon: FileText, label: 'Degree Audit', key: 'degree-audit' },
    { href: '/assignments', icon: ClipboardList, label: 'Assignments', key: 'assignments' },
    { href: '/grades', icon: BarChart3, label: 'My Grades', key: 'grades' },
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
    <nav className={`${themeColor} text-white shadow-lg dark:shadow-gray-900/20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8" />
              <span className="text-xl font-bold">EduPortal</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const isActive = currentPage === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-white/20'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
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
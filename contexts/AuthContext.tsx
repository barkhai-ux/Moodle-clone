'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { AuthService } from '@/lib/auth';
import { DataService } from '@/lib/data-service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  enrolledCourses: string[];
  enrollInCourse: (courseId: string) => void;
  dropCourse: (courseId: string) => void;
  updateAvatar: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    
    // Load enrolled courses from database for the current user
    if (currentUser) {
      loadUserEnrollments(currentUser.id);
    }
    
    setLoading(false);
  }, []);

  const loadUserEnrollments = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/enrollments?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const courseIds = data.enrollments.map((enrollment: any) => enrollment.course.id);
        setEnrolledCourses(courseIds);
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const user = await AuthService.login(email, password);
      setUser(user);
      
      // Load user's enrolled courses from database
      await loadUserEnrollments(user.id);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setEnrolledCourses([]);
    router.push('/');
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          courseId,
        }),
      });

      if (response.ok) {
        await loadUserEnrollments(user.id);
      } else {
        const errorData = await response.json();
        console.error('Enrollment error:', errorData.error);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const dropCourse = async (courseId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/courses/drop?studentId=${user.id}&courseId=${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadUserEnrollments(user.id);
      } else {
        const errorData = await response.json();
        console.error('Drop course error:', errorData.error);
      }
    } catch (error) {
      console.error('Error dropping course:', error);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!user) return;
    
    try {
      const updatedUser = await DataService.updateUserProfile({ avatar: avatarUrl }, user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      enrolledCourses, 
      enrollInCourse, 
      dropCourse,
      updateAvatar
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
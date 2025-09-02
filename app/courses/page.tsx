'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { CourseCard } from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/data-service';
import { Search, Plus, BookOpen } from 'lucide-react';
import { Course } from '@/types';

export default function CoursesPage() {
  const { user, enrolledCourses } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isTeacher = user?.role === 'TEACHER';
  
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      try {
        let fetchedCourses: Course[];
        if (isTeacher) {
          fetchedCourses = await DataService.getCourses({ instructorId: user.id });
        } else {
          // For students, we'll get all courses and filter by enrollment
          fetchedCourses = await DataService.getCourses();
          fetchedCourses = fetchedCourses.filter(course => enrolledCourses.includes(course.id));
        }
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, enrolledCourses, isTeacher]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="courses" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isTeacher ? 'My Courses' : 'Enrolled Courses'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {isTeacher 
                  ? 'Manage and monitor your teaching courses'
                  : 'Access your enrolled courses and materials'
                }
              </p>
            </div>
            
            {isTeacher && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No courses found' : 'No courses available'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : isTeacher 
                    ? 'Create your first course to get started'
                    : 'Contact your instructor for course enrollment'
                }
              </p>
              {isTeacher && !searchTerm && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
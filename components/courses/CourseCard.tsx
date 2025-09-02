'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';
import { Users, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer">
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg overflow-hidden">
          <img 
            src={course.coverImage} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{course.enrolledStudents.length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Badge variant="secondary">{isTeacher ? 'Teaching' : 'Enrolled'}</Badge>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">
                  {course.instructor.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-gray-600">{course.instructor.name}</span>
            </div>
            
            <Link href={`/courses/${course.id}`}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                {isTeacher ? 'Manage' : 'Enter'}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
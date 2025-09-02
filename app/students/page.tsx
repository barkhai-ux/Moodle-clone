'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/data-service';
import { Search, Users, Mail, Calendar, BookOpen } from 'lucide-react';
import { User, Course } from '@/types';

export default function StudentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Only teachers should access this page
  if (user?.role !== 'TEACHER') {
      return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="students" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300">Only teachers can access this page.</p>
        </div>
      </main>
    </div>
  );
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const fetchedCourses = await DataService.getCourses({ instructorId: user.id });
        setCourses(fetchedCourses);
        
        // Get all students from teacher's courses
        const enrolledStudents = fetchedCourses.flatMap(course => course.enrolledStudents);
        const uniqueStudents = enrolledStudents.filter((student, index, self) => 
          index === self.findIndex(s => s.id === student.id)
        );
        setStudents(uniqueStudents);
      } catch (error) {
        console.error('Error fetching students data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentCourses = (studentId: string) => {
    return courses.filter(course => 
      course.enrolledStudents.some(student => student.id === studentId)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="students" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading students...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="students" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
              <p className="text-gray-600">Manage and track your students' progress</p>
            </div>
            
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Users className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Students</p>
                    <p className="text-2xl font-bold text-blue-800">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Courses</p>
                    <p className="text-2xl font-bold text-green-800">{courses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">This Semester</p>
                    <p className="text-2xl font-bold text-purple-800">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Students List */}
          {filteredStudents.length > 0 ? (
            <div className="grid gap-4">
              {filteredStudents.map((student) => {
                const studentCourses = getStudentCourses(student.id);
                
                return (
                  <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                            <Badge variant="secondary">Student</Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{student.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{studentCourses.length} courses</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {studentCourses.map((course) => (
                              <Badge key={course.id} variant="outline" className="text-xs">
                                {course.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline">
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No students found' : 'No students enrolled yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'Students will appear here once they enroll in your courses'
                  }
                </p>
                {!searchTerm && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Users className="mr-2 h-4 w-4" />
                    Invite Students
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

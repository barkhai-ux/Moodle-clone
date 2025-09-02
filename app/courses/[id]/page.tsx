'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/data-service';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare,
  Settings,
  Play,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Course, Assignment, Announcement } from '@/types';

interface CoursePageProps {
  params: { id: string };
}

export default function CoursePage({ params }: CoursePageProps) {
  const { user, enrolledCourses } = useAuth();
  const isTeacher = user?.role === 'TEACHER';
  const [course, setCourse] = useState<Course | null>(null);
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([]);
  const [courseAnnouncements, setCourseAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCourse, fetchedAssignments, fetchedAnnouncements] = await Promise.all([
          DataService.getCourseById(params.id),
          DataService.getAssignments({ courseId: params.id }),
          DataService.getAnnouncements({ courseId: params.id })
        ]);
        
        setCourse(fetchedCourse);
        setCourseAssignments(fetchedAssignments);
        setCourseAnnouncements(fetchedAnnouncements);
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Check access permissions
  const hasAccess = () => {
    if (!user || !course) return false;
    
    if (user.role === 'TEACHER') {
      return course.instructor.id === user.id;
    } else if (user.role === 'STUDENT') {
      return enrolledCourses.includes(course.id);
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="courses" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading course...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="courses" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
            <p className="text-gray-600">The course you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  // Check if user has access to this course
  if (!hasAccess()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="courses" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">
              {user?.role === 'STUDENT' 
                ? "You are not enrolled in this course." 
                : "You don't have permission to access this course."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const courseMaterials = [
    { id: '1', title: 'Introduction to Programming', type: 'video', duration: '45 min' },
    { id: '2', title: 'Course Syllabus', type: 'pdf', size: '2.3 MB' },
    { id: '3', title: 'Reading List', type: 'document', pages: '12 pages' },
    { id: '4', title: 'Lab Environment Setup', type: 'video', duration: '30 min' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="courses" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64 h-36 bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src={course.coverImage} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolledStudents.length} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Started {new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {isTeacher && (
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Course Settings
                  </Button>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Instructor:</p>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {course.instructor.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{course.instructor.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {course.description}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      This comprehensive course will take you through the fundamental concepts of computer science,
                      including programming principles, data structures, algorithms, and problem-solving techniques.
                      You'll gain hands-on experience with modern development tools and practices.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Students</span>
                      <span className="font-medium">{course.enrolledStudents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assignments</span>
                      <span className="font-medium">{courseAssignments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Materials</span>
                      <span className="font-medium">{courseMaterials.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="grid gap-4">
              {courseMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {material.type === 'video' ? (
                            <Play className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{material.title}</h4>
                          <p className="text-sm text-gray-600">
                            {material.type === 'video' ? material.duration : 
                             material.type === 'pdf' ? material.size : material.pages}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <div className="grid gap-4">
              {courseAssignments.map((assignment) => {
                const daysUntilDue = Math.ceil(
                  (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isOverdue = daysUntilDue < 0;
                
                return (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {assignment.title}
                          </h3>
                          <p className="text-gray-700 mb-4">{assignment.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            <span>{assignment.maxPoints} points</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={isOverdue ? "destructive" : "default"}>
                            {isOverdue ? 'Overdue' : `${daysUntilDue} days left`}
                          </Badge>
                          <Button size="sm">
                            {isTeacher ? 'View Submissions' : 'Submit'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <div className="grid gap-4">
              {courseAnnouncements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <span>{announcement.title}</span>
                      </CardTitle>
                      <span className="text-sm text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
              
              {courseAnnouncements.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600">No announcements yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  TrendingUp,
  Calendar,
  FileText,
  Star,
  Settings,
  Plus,
  MessageSquare,
  Upload,
  BarChart3,
} from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Assignment, Grade } from '@/types';
import Link from 'next/link';

export function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [fetchedCourses, fetchedAssignments, fetchedGrades] = await Promise.all([
          DataService.getCourses({ instructorId: user.id }),
          DataService.getAssignments({ instructorId: user.id }),
          DataService.getGrades()
        ]);
        
        setCourses(fetchedCourses);
        setAssignments(fetchedAssignments);
        setGrades(fetchedGrades);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalStudents = courses.reduce((total, course) => total + course.enrolledStudents.length, 0);
  const pendingGrades = assignments.length - grades.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Teacher'}!</h1>
        <p className="text-blue-100">Manage your courses and track student progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">My Courses</p>
                <p className="text-2xl font-bold text-blue-800">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Students</p>
                <p className="text-2xl font-bold text-green-800">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Assignments</p>
                <p className="text-2xl font-bold text-purple-800">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending Grades</p>
                <p className="text-2xl font-bold text-orange-800">{pendingGrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Grade Submissions
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Announcement
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload Materials
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New submission received</p>
                <p className="text-xs text-gray-600">Alex Smith submitted Algorithm Project</p>
              </div>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Course enrollment</p>
                <p className="text-xs text-gray-600">3 new students enrolled in Web Dev</p>
              </div>
              <span className="text-xs text-gray-500">1d ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Assignment created</p>
                <p className="text-xs text-gray-600">Portfolio Website assignment posted</p>
              </div>
              <span className="text-xs text-gray-500">2d ago</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span>My Courses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    <img 
                      src={course.coverImage} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{course.enrolledStudents.length} students</span>
                    </div>
                  </div>
                  
                  {/* Course Management Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" className="w-full">
                        <BookOpen className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/courses/${course.id}/manage`}>
                      <Button size="sm" variant="outline" className="w-full">
                        <Settings className="mr-1 h-3 w-3" />
                        Manage
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    <Link href={`/courses/${course.id}/assignments`}>
                      <Button size="sm" variant="ghost" className="w-full text-xs">
                        <ClipboardList className="mr-1 h-3 w-3" />
                        Assign
                      </Button>
                    </Link>
                    <Link href={`/courses/${course.id}/grades`}>
                      <Button size="sm" variant="ghost" className="w-full text-xs">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        Grades
                      </Button>
                    </Link>
                    <Link href={`/courses/${course.id}/announcements`}>
                      <Button size="sm" variant="ghost" className="w-full text-xs">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        Announce
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
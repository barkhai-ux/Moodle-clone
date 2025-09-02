'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Calendar,
  FileText,
  Award,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Assignment, Grade } from '@/types';
import Link from 'next/link';

export function StudentDashboard() {
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
          DataService.getCourses({ studentId: user.id }),
          DataService.getAssignments(),
          DataService.getGrades({ studentId: user.id })
        ]);
        
        setCourses(fetchedCourses);
        setAssignments(fetchedAssignments.filter(assignment => 
          fetchedCourses.some(course => course.id === assignment.courseId)
        ));
        setGrades(fetchedGrades);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const upcomingAssignments = assignments.slice(0, 3);
  const recentGrades = grades;

  const calculateGPA = () => {
    if (recentGrades.length === 0) return 0;
    const totalPercentage = recentGrades.reduce((sum, grade) => 
      sum + (grade.points / grade.maxPoints) * 100, 0
    );
    return (totalPercentage / recentGrades.length / 25).toFixed(2);
  };

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
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
        <p className="text-teal-100">Ready to continue your learning journey?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Enrolled Courses</p>
                <p className="text-2xl font-bold text-blue-800">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-orange-800">{upcomingAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">GPA</p>
                <p className="text-2xl font-bold text-green-800">{calculateGPA()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-purple-800">{recentGrades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span>Upcoming Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAssignments.map((assignment) => {
              const course = courses.find(c => c.id === assignment.courseId);
              const daysUntilDue = Math.ceil(
                (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                    <p className="text-sm text-gray-600">{course?.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Due in {daysUntilDue} days
                      </span>
                    </div>
                  </div>
                  <Badge variant={daysUntilDue <= 2 ? "destructive" : "secondary"}>
                    {assignment.maxPoints} pts
                  </Badge>
                </div>
              );
            })}
            <Link href="/assignments">
              <Button variant="outline" className="w-full">
                View All Assignments
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <span>Recent Grades</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGrades.map((grade) => {
              const assignment = assignments.find(a => a.id === grade.assignmentId);
              const course = courses.find(c => c.id === grade.courseId);
              const percentage = (grade.points / grade.maxPoints) * 100;
              
              return (
                <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{assignment?.title}</h4>
                    <p className="text-sm text-gray-600">{course?.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {grade.points}/{grade.maxPoints}
                    </div>
                    <Badge 
                      variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}
                    >
                      {percentage.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
            <Link href="/grades">
              <Button variant="outline" className="w-full">
                View All Grades
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <span>My Courses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{course.instructor.name}</span>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" variant="outline">
                        View Course
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
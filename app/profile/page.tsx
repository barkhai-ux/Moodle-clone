'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Clock,
  GraduationCap,
  Star,
  BarChart3,
  FileText,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/data-service';
import { Course, Grade, Assignment } from '@/types';
import { AvatarSelector } from '@/components/ui/avatar-selector';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateAvatar } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const [fetchedCourses, fetchedGrades, fetchedAssignments] = await Promise.all([
          DataService.getCourses({ studentId: user.id }),
          DataService.getGrades({ studentId: user.id }),
          DataService.getAssignments()
        ]);
        
        setCourses(fetchedCourses);
        setGrades(fetchedGrades);
        setAssignments(fetchedAssignments.filter(assignment => 
          fetchedCourses.some(course => course.id === assignment.courseId)
        ));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    
    // Calculate GPA using standard 4.0 scale
    const gradePoints = grades.map(grade => {
      const percentage = (grade.points / grade.maxPoints) * 100;
      if (percentage >= 93) return 4.0;
      if (percentage >= 90) return 3.7;
      if (percentage >= 87) return 3.3;
      if (percentage >= 83) return 3.0;
      if (percentage >= 80) return 2.7;
      if (percentage >= 77) return 2.3;
      if (percentage >= 73) return 2.0;
      if (percentage >= 70) return 1.7;
      if (percentage >= 67) return 1.3;
      if (percentage >= 63) return 1.0;
      if (percentage >= 60) return 0.7;
      return 0.0;
    });
    
    const average = gradePoints.reduce((sum, points) => sum + points, 0) / gradePoints.length;
    return average.toFixed(2);
  };

  const calculateCreditsEarned = () => {
    return courses.reduce((total, course) => total + (course.credits || 3), 0);
  };

  const getGradeDistribution = () => {
    const distribution = {
      A: 0, B: 0, C: 0, D: 0, F: 0
    };

    grades.forEach(grade => {
      const percentage = (grade.points / grade.maxPoints) * 100;
      if (percentage >= 90) distribution.A++;
      else if (percentage >= 80) distribution.B++;
      else if (percentage >= 70) distribution.C++;
      else if (percentage >= 60) distribution.D++;
      else distribution.F++;
    });

    return distribution;
  };

  const getCourseStats = () => {
    const completedCourses = grades.length > 0 ? 
      [...new Set(grades.map(grade => grade.courseId))].length : 0;
    
    return {
      totalEnrolled: courses.length,
      completed: completedCourses,
      inProgress: courses.length - completedCourses
    };
  };

  const gradeDistribution = getGradeDistribution();
  const courseStats = getCourseStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="profile" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="profile" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-gray-200 shadow-sm">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <AvatarSelector
                      currentAvatar={user?.avatar}
                      onAvatarChange={updateAvatar}
                      userName={user?.name || 'Student'}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                  <div className="flex items-center mt-3">
                    <Badge variant="secondary" className="text-sm">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Student
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-teal-600">{calculateGPA()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">GPA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-blue-800">{courseStats.totalEnrolled}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Completed</p>
                    <p className="text-2xl font-bold text-green-800">{courseStats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600 font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-orange-800">{courseStats.inProgress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Credits Earned</p>
                    <p className="text-2xl font-bold text-purple-800">{calculateCreditsEarned()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <Tabs defaultValue="academic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="academic">Academic Record</TabsTrigger>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="grades">Grade Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="academic" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-teal-500" />
                      <span>Academic Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current GPA</span>
                      <span className="font-semibold">{calculateGPA()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Credits</span>
                      <span className="font-semibold">{calculateCreditsEarned()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Courses Completed</span>
                      <span className="font-semibold">{courseStats.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Assignments</span>
                      <span className="font-semibold">{grades.length}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Grade Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span>Grade Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(gradeDistribution).map(([grade, count]) => (
                      <div key={grade} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{grade}</span>
                        <div className="flex items-center space-x-2">
                          <Progress 
                            value={grades.length > 0 ? (count / grades.length) * 100 : 0} 
                            className="w-20" 
                          />
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span>Enrolled Courses</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => {
                      const courseGrades = grades.filter(g => g.courseId === course.id);
                      const courseGPA = courseGrades.length > 0 ? 
                        (courseGrades.reduce((sum, grade) => {
                          const percentage = (grade.points / grade.maxPoints) * 100;
                          if (percentage >= 90) return sum + 4.0;
                          if (percentage >= 80) return sum + 3.0;
                          if (percentage >= 70) return sum + 2.0;
                          if (percentage >= 60) return sum + 1.0;
                          return sum;
                        }, 0) / courseGrades.length).toFixed(2) : 'N/A';

                      return (
                        <Card key={course.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                              <img 
                                src={course.coverImage || '/placeholder-course.jpg'} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Instructor:</span>
                                <span className="font-medium">{course.instructor.name}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Credits:</span>
                                <span className="font-medium">{course.credits || 3}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Course GPA:</span>
                                <span className="font-medium">{courseGPA}</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Link href={`/courses/${course.id}`}>
                                <Button size="sm" variant="outline" className="w-full">
                                  View Course
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grades" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span>Detailed Grades</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {grades.map((grade) => {
                      const assignment = assignments.find(a => a.id === grade.assignmentId);
                      const course = courses.find(c => c.id === grade.courseId);
                      const percentage = (grade.points / grade.maxPoints) * 100;
                      
                      return (
                        <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{assignment?.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{course?.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : 'Not graded'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
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
                    {grades.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No grades available yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}


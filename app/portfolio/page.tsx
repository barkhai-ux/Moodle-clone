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
  Award, 
  BookOpen, 
  GraduationCap,
  Star,
  BarChart3,
  Trophy,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/data-service';
import { Course, Grade, Assignment } from '@/types';
import Link from 'next/link';

export default function PortfolioPage() {
  const { user } = useAuth();
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
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    
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
    
    const average = gradePoints.reduce((sum: number, points: number) => sum + points, 0) / gradePoints.length;
    return average.toFixed(2);
  };

  const calculateCreditsEarned = () => {
    return courses.reduce((total, course) => total + (course.credits || 3), 0);
  };

  const getTopCourses = () => {
    const courseAverages = courses.map(course => {
      const courseGrades = grades.filter(g => g.courseId === course.id);
      if (courseGrades.length === 0) return { course, average: 0 };
      
      const average = courseGrades.reduce((sum, grade) => 
        sum + (grade.points / grade.maxPoints) * 100, 0
      ) / courseGrades.length;
      
      return { course, average };
    });
    
    return courseAverages
      .filter(item => item.average > 0)
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (grades.length >= 10) {
      achievements.push({
        title: "Dedicated Learner",
        description: "Completed 10+ assignments",
        icon: CheckCircle,
        color: "text-green-600"
      });
    }
    
    if (parseFloat(calculateGPA().toString()) >= 3.5) {
      achievements.push({
        title: "Academic Excellence",
        description: "Maintained 3.5+ GPA",
        icon: Trophy,
        color: "text-yellow-600"
      });
    }
    
    if (courses.length >= 5) {
      achievements.push({
        title: "Course Explorer",
        description: "Enrolled in 5+ courses",
        icon: BookOpen,
        color: "text-blue-600"
      });
    }
    
    return achievements;
  };

  const topCourses = getTopCourses();
  const achievements = getAchievements();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="portfolio" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading portfolio...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="portfolio" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Portfolio Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg shadow-lg">
            <div className="p-8">
              <div className="flex items-center space-x-6">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-3xl">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-2">{user?.name}</h1>
                  <p className="text-xl text-teal-100 mb-4">Student Portfolio</p>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{calculateGPA()}</div>
                      <div className="text-sm text-teal-100">GPA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{courses.length}</div>
                      <div className="text-sm text-teal-100">Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{calculateCreditsEarned()}</div>
                      <div className="text-sm text-teal-100">Credits</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="courses">Academic Work</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
                      <span className="font-semibold text-lg">{calculateGPA()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Credits</span>
                      <span className="font-semibold">{calculateCreditsEarned()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Courses Enrolled</span>
                      <span className="font-semibold">{courses.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Assignments Completed</span>
                      <span className="font-semibold">{grades.length}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span>Top Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topCourses.map((item, index) => (
                        <div key={item.course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-teal-600 dark:text-teal-300">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{item.course.title}</h4>
                              <p className="text-xs text-gray-500">{item.course.instructor.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-teal-600">
                              {item.average.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span>Academic Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement, index) => (
                      <Card key={index} className="border-2 border-gray-100 hover:border-teal-200 transition-colors">
                        <CardContent className="p-6 text-center">
                          <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center`}>
                            <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {achievements.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Complete more courses and assignments to earn achievements!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span>Academic Work</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <Card key={course.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                              <img 
                                src={course.coverImage || '/placeholder-course.jpg'} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                            <div className="space-y-2 mb-4">
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
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm" variant="outline" className="w-full">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Course
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      );
                    })}
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

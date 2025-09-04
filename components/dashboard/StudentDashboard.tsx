'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Calendar,
  FileText,
  Award,
  AlertCircle,
  BarChart3,
  User,
  Briefcase,
  Star,
  Trophy,
  CheckCircle,
  ExternalLink,
  Mail,
  GraduationCap,
  Target
} from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { useAuth } from '@/contexts/AuthContext';
import { Course, Assignment, Grade } from '@/types';
import { AvatarSelector } from '@/components/ui/avatar-selector';
import Link from 'next/link';

export function StudentDashboard() {
  const { user, updateAvatar } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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
    
    // Calculate GPA using standard 4.0 scale
    const gradePoints = recentGrades.map(grade => {
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
      Array.from(new Set(grades.map(grade => grade.courseId))).length : 0;
    
    return {
      totalEnrolled: courses.length,
      completed: completedCourses,
      inProgress: courses.length - completedCourses
    };
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

  const gradeDistribution = getGradeDistribution();
  const courseStats = getCourseStats();
  const topCourses = getTopCourses();
  const achievements = getAchievements();

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h1>
            <p className="text-teal-100">Ready to continue your learning journey?</p>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
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
                        {course.coverImage && !imageErrors.has(course.id) ? (
                          <img 
                            src={course.coverImage} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={() => setImageErrors(prev => new Set(prev).add(course.id))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                            <div className="text-center text-white">
                              <div className="text-2xl font-bold mb-1">{course.title.charAt(0).toUpperCase()}</div>
                              <div className="text-xs font-medium opacity-90">{course.title}</div>
                            </div>
                          </div>
                        )}
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
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg shadow-lg">
            <div className="p-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-3xl">{user?.name?.charAt(0)}</AvatarFallback>
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
                              {course.coverImage && !imageErrors.has(course.id) ? (
                                <img 
                                  src={course.coverImage} 
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                  onError={() => setImageErrors(prev => new Set(prev).add(course.id))}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                  <div className="text-center text-white">
                                    <div className="text-2xl font-bold mb-1">{course.title.charAt(0).toUpperCase()}</div>
                                    <div className="text-xs font-medium opacity-90">{course.title}</div>
                                  </div>
                                </div>
                              )}
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
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
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
                              {course.coverImage && !imageErrors.has(course.id) ? (
                                <img 
                                  src={course.coverImage} 
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                  onError={() => setImageErrors(prev => new Set(prev).add(course.id))}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                  <div className="text-center text-white">
                                    <div className="text-2xl font-bold mb-1">{course.title.charAt(0).toUpperCase()}</div>
                                    <div className="text-xs font-medium opacity-90">{course.title}</div>
                                  </div>
                                </div>
                              )}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
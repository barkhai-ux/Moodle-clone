'use client';

import React from 'react';
import { DegreeProgram, DegreeRequirement, Course } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  TrendingUp,
  AlertCircle,
  Target
} from 'lucide-react';

interface DegreeAuditProps {
  degreeProgram: DegreeProgram;
  enrolledCourses: string[];
  allCourses: Course[];
}

export function DegreeAudit({ degreeProgram, enrolledCourses, allCourses }: DegreeAuditProps) {
  const calculateCompletedCredits = (requirement: DegreeRequirement) => {
    return enrolledCourses
      .filter(courseId => requirement.courses.includes(courseId))
      .reduce((total, courseId) => {
        const course = allCourses.find(c => c.id === courseId);
        return total + (course?.credits || 0);
      }, 0);
  };

  const getRequirementStatus = (requirement: DegreeRequirement) => {
    const completed = calculateCompletedCredits(requirement);
    const percentage = (completed / requirement.requiredCredits) * 100;
    
    if (percentage >= 100) return 'completed';
    if (percentage >= 75) return 'almost-complete';
    if (percentage >= 50) return 'in-progress';
    return 'not-started';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'almost-complete':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'almost-complete':
        return <TrendingUp className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const totalCompletedCredits = degreeProgram.requirements.reduce((total, req) => {
    return total + calculateCompletedCredits(req);
  }, 0);

  const overallProgress = (totalCompletedCredits / degreeProgram.totalCreditsRequired) * 100;

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-200" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                {degreeProgram.name}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {degreeProgram.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Progress
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {totalCompletedCredits} / {degreeProgram.totalCreditsRequired} credits
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(overallProgress)}% Complete
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {degreeProgram.totalCreditsRequired - totalCompletedCredits} credits remaining
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {degreeProgram.requirements.filter(req => getRequirementStatus(req) === 'completed').length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {degreeProgram.requirements.filter(req => getRequirementStatus(req) === 'in-progress' || getRequirementStatus(req) === 'almost-complete').length}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">In Progress</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {degreeProgram.requirements.filter(req => getRequirementStatus(req) === 'not-started').length}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Not Started</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {degreeProgram.requirements.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Categories</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Degree Requirements
        </h3>
        
        {degreeProgram.requirements.map((requirement) => {
          const completed = calculateCompletedCredits(requirement);
          const status = getRequirementStatus(requirement);
          const progress = (completed / requirement.requiredCredits) * 100;
          
          return (
            <Card key={requirement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {requirement.categoryName}
                      </h4>
                      <Badge className={getStatusColor(status)}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                    {requirement.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {requirement.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Credits Progress
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {completed} / {requirement.requiredCredits} credits
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(progress)}% Complete
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {requirement.requiredCredits - completed} credits remaining
                    </span>
                  </div>
                </div>

                {/* Enrolled Courses in this Category */}
                {completed > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Completed Courses:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {enrolledCourses
                        .filter(courseId => requirement.courses.includes(courseId))
                        .map(courseId => {
                          const course = allCourses.find(c => c.id === courseId);
                          return course ? (
                            <Badge key={courseId} variant="outline" className="text-xs">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {course.title} ({course.credits} credits)
                            </Badge>
                          ) : null;
                        })}
                    </div>
                  </div>
                )}

                {/* Available Courses */}
                {requirement.courses.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Courses:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {requirement.courses
                        .filter(courseId => !enrolledCourses.includes(courseId))
                        .map(courseId => {
                          const course = allCourses.find(c => c.id === courseId);
                          return course ? (
                            <Badge key={courseId} variant="secondary" className="text-xs">
                              {course.title} ({course.credits} credits)
                            </Badge>
                          ) : null;
                        })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


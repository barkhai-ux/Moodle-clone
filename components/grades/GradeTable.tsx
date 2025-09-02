'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grade, Assignment, Course } from '@/types';
import { BarChart3, TrendingUp, Award } from 'lucide-react';

interface GradeTableProps {
  grades: Grade[];
  assignments: Assignment[];
  courses: Course[];
  showStudent?: boolean;
}

export function GradeTable({ grades, assignments, courses, showStudent = false }: GradeTableProps) {
  const getAssignment = (assignmentId: string) => 
    assignments.find(a => a.id === assignmentId);
  
  const getCourse = (courseId: string) => 
    courses.find(c => c.id === courseId);

  const calculateOverallGrade = () => {
    if (grades.length === 0) return 0;
    const totalPercentage = grades.reduce((sum, grade) => 
      sum + (grade.points / grade.maxPoints) * 100, 0
    );
    return totalPercentage / grades.length;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const overallGrade = calculateOverallGrade();

  return (
    <div className="space-y-6">
      {/* Grade Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Overall Grade</p>
                <p className="text-2xl font-bold text-green-800">
                  {overallGrade.toFixed(1)}% ({getLetterGrade(overallGrade)})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-blue-800">{grades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Assignments</p>
                <p className="text-2xl font-bold text-purple-800">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Grade Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Date Graded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => {
                const assignment = getAssignment(grade.assignmentId);
                const course = getCourse(grade.courseId);
                const percentage = (grade.points / grade.maxPoints) * 100;
                const letterGrade = getLetterGrade(percentage);
                
                return (
                  <TableRow key={grade.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{assignment?.title}</p>
                        {grade.feedback && (
                          <p className="text-xs text-gray-500 mt-1">{grade.feedback}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{course?.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{grade.points}/{grade.maxPoints}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(percentage)}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={percentage >= 60 ? "default" : "destructive"}>
                        {letterGrade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(grade.gradedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {grades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No grades available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
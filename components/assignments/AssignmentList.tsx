'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Assignment, Course } from '@/types';
import { Calendar, Clock, FileText, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AssignmentListProps {
  assignments: Assignment[];
  courses: Course[];
}

export function AssignmentList({ assignments, courses }: AssignmentListProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const getCourse = (courseId: string) => 
    courses.find(c => c.id === courseId);

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedAssignments = assignments.sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isTeacher ? 'Manage Assignments' : 'My Assignments'}
        </h1>
        {isTeacher && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {sortedAssignments.map((assignment) => {
          const course = getCourse(assignment.courseId);
          const daysUntilDue = getDaysUntilDue(assignment.dueDate);
          const isOverdue = daysUntilDue < 0;
          const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;

          return (
            <Card 
              key={assignment.id} 
              className={`hover:shadow-md transition-all duration-200 ${
                isOverdue ? 'border-red-200 bg-red-50' : 
                isDueSoon ? 'border-orange-200 bg-orange-50' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {course?.title}
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        {assignment.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
                           daysUntilDue === 0 ? 'Due today' :
                           `${daysUntilDue} days left`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{assignment.maxPoints} points</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant={
                        isOverdue ? "destructive" : 
                        isDueSoon ? "secondary" : 
                        "default"
                      }
                    >
                      {assignment.maxPoints} pts
                    </Badge>
                    
                    <Button 
                      size="sm" 
                      className={
                        isTeacher 
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-teal-600 hover:bg-teal-700"
                      }
                    >
                      {isTeacher ? 'View Submissions' : 'Submit Work'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No assignments yet
            </h3>
            <p className="text-gray-600 mb-4">
              {isTeacher 
                ? "Create your first assignment to get started"
                : "Check back later for new assignments"
              }
            </p>
            {isTeacher && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
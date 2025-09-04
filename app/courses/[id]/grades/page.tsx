'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/data-service';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Star,
  MessageSquare,
} from 'lucide-react';
import { Course, Assignment, Grade, Submission } from '@/types';
import Link from 'next/link';

interface GradePageProps {
  params: { id: string };
}

// Mock data for submissions
const mockSubmissions: Submission[] = [
  {
    id: '1',
    assignmentId: '1',
    studentId: 'student1',
    content: 'This is my submission for the algorithm project. I implemented the sorting algorithm as requested.',
    submittedAt: '2024-01-15T10:30:00Z',
    grade: 85,
    feedback: 'Good implementation, but could improve efficiency.'
  },
  {
    id: '2',
    assignmentId: '1',
    studentId: 'student2',
    content: 'Portfolio website submission with responsive design.',
    submittedAt: '2024-01-14T15:45:00Z',
    grade: 92,
    feedback: 'Excellent work! Great attention to detail.'
  },
  {
    id: '3',
    assignmentId: '2',
    studentId: 'student1',
    content: 'Database design project submission.',
    submittedAt: '2024-01-13T09:20:00Z',
    grade: undefined,
    feedback: undefined
  }
];

export default function GradePage({ params }: GradePageProps) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradeData, setGradeData] = useState({
    points: 0,
    feedback: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCourse, fetchedAssignments] = await Promise.all([
          DataService.getCourseById(params.id),
          DataService.getAssignments({ courseId: params.id })
        ]);
        
        setCourse(fetchedCourse);
        setAssignments(fetchedAssignments);
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Check if user is the instructor of this course
  const isInstructor = course?.instructor.id === user?.id;

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      // Here you would typically call an API to update the grade
      const updatedSubmissions = submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? { ...sub, grade: gradeData.points, feedback: gradeData.feedback }
          : sub
      );
      
      setSubmissions(updatedSubmissions);
      setGradeData({ points: 0, feedback: '' });
      setIsGradeDialogOpen(false);
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error grading submission:', error);
    }
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      points: submission.grade || 0,
      feedback: submission.feedback || ''
    });
    setIsGradeDialogOpen(true);
  };

  const getAssignmentById = (assignmentId: string) => {
    return assignments.find(a => a.id === assignmentId);
  };

  const getStudentById = (studentId: string) => {
    return course?.enrolledStudents.find(s => s.id === studentId);
  };

  const pendingSubmissions = submissions.filter(s => s.grade === undefined);
  const gradedSubmissions = submissions.filter(s => s.grade !== undefined);
  const averageGrade = gradedSubmissions.length > 0 
    ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="courses" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading grades...</p>
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

  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="courses" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to view grades for this course.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="courses" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={course.coverImage} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">Grades & Submissions</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link href={`/courses/${course.id}/manage`}>
                <Button variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Course Management
                </Button>
              </Link>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Grades
              </Button>
            </div>
          </div>
        </div>

        {/* Grade Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Submissions</p>
                  <p className="text-2xl font-bold text-blue-800">{submissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Graded</p>
                  <p className="text-2xl font-bold text-green-800">{gradedSubmissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-orange-800">{pendingSubmissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Average Grade</p>
                  <p className="text-2xl font-bold text-purple-800">{averageGrade.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => {
                  const assignment = getAssignmentById(submission.assignmentId);
                  const student = getStudentById(submission.studentId);
                  const isGraded = submission.grade !== undefined;
                  
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student?.name.charAt(0) || 'S'}
                            </span>
                          </div>
                          <span className="font-medium">{student?.name || 'Unknown Student'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{assignment?.title || 'Unknown Assignment'}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {isGraded ? (
                          <span className="font-medium">{submission.grade}%</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isGraded ? "default" : "secondary"}>
                          {isGraded ? 'Graded' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          {!isGraded ? (
                            <Button size="sm" onClick={() => openGradeDialog(submission)}>
                              <Star className="mr-2 h-4 w-4" />
                              Grade
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => openGradeDialog(submission)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Grade Dialog */}
        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedSubmission?.grade !== undefined ? 'Edit Grade' : 'Grade Submission'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedSubmission && (
                <div className="space-y-4">
                  <div>
                    <Label>Student</Label>
                    <p className="text-sm text-gray-600">
                      {getStudentById(selectedSubmission.studentId)?.name || 'Unknown Student'}
                    </p>
                  </div>
                  <div>
                    <Label>Assignment</Label>
                    <p className="text-sm text-gray-600">
                      {getAssignmentById(selectedSubmission.assignmentId)?.title || 'Unknown Assignment'}
                    </p>
                  </div>
                  <div>
                    <Label>Submission Content</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">{selectedSubmission.content}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        value={gradeData.points}
                        onChange={(e) => setGradeData({ ...gradeData, points: parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Max Points</Label>
                      <p className="text-sm text-gray-600 pt-2">
                        {getAssignmentById(selectedSubmission.assignmentId)?.maxPoints || 100}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={gradeData.feedback}
                      onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                      placeholder="Provide feedback to the student..."
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGradeSubmission}>
                {selectedSubmission?.grade !== undefined ? 'Update Grade' : 'Submit Grade'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

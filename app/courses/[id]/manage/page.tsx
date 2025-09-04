'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  MessageSquare,
  Settings,
  Upload,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  BarChart3,
  Clock,
  Star,
  Send,
  X,
} from 'lucide-react';
import { Course, Assignment, Announcement, Submission, CourseMaterial } from '@/types';
import Link from 'next/link';

interface CourseManagePageProps {
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

export default function CourseManagePage({ params }: CourseManagePageProps) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Assignment states
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100
  });

  // Announcement states
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);
  const [isEditAnnouncementOpen, setIsEditAnnouncementOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: ''
  });

  // Grade states
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradeData, setGradeData] = useState({
    points: 0,
    feedback: ''
  });

  // Material states
  const [isUploadMaterialOpen, setIsUploadMaterialOpen] = useState(false);
  const [isEditMaterialOpen, setIsEditMaterialOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialData, setMaterialData] = useState({
    title: '',
    description: ''
  });

  // Course edit states
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [courseEditData, setCourseEditData] = useState({
    title: '',
    description: '',
    coverImage: '',
    credits: 3,
    capacity: 0,
    classNumber: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCourse, fetchedAssignments, fetchedAnnouncements, fetchedMaterials] = await Promise.all([
          DataService.getCourseById(params.id),
          DataService.getAssignments({ courseId: params.id }),
          DataService.getAnnouncements({ courseId: params.id }),
          DataService.getCourseMaterials(params.id)
        ]);
        
        setCourse(fetchedCourse);
        setAssignments(fetchedAssignments);
        setAnnouncements(fetchedAnnouncements);
        setCourseMaterials(fetchedMaterials);
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

  // Assignment functions
  const handleCreateAssignment = async () => {
    if (!user) return;
    
    try {
      const assignment = await DataService.createAssignment({
        courseId: params.id,
        title: newAssignment.title,
        description: newAssignment.description,
        dueDate: newAssignment.dueDate,
        maxPoints: newAssignment.maxPoints
      });

      if (assignment) {
        setAssignments([...assignments, assignment]);
        setNewAssignment({ title: '', description: '', dueDate: '', maxPoints: 100 });
        setIsCreateAssignmentOpen(false);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const success = await DataService.deleteAssignment(assignmentId);
      if (success) {
        setAssignments(assignments.filter(a => a.id !== assignmentId));
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  // Announcement functions
  const handleCreateAnnouncement = async () => {
    if (!user) return;
    
    try {
      const announcement = await DataService.createAnnouncement({
        courseId: params.id,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        authorId: user.id
      });

      if (announcement) {
        setAnnouncements([announcement, ...announcements]);
        setNewAnnouncement({ title: '', content: '' });
        setIsCreateAnnouncementOpen(false);
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleEditAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      const updatedAnnouncement = await DataService.updateAnnouncement(selectedAnnouncement.id, {
        title: newAnnouncement.title,
        content: newAnnouncement.content
      });

      if (updatedAnnouncement) {
        setAnnouncements(announcements.map(a => 
          a.id === selectedAnnouncement.id ? updatedAnnouncement : a
        ));
        setNewAnnouncement({ title: '', content: '' });
        setIsEditAnnouncementOpen(false);
        setSelectedAnnouncement(null);
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const success = await DataService.deleteAnnouncement(announcementId);
      if (success) {
        setAnnouncements(announcements.filter(a => a.id !== announcementId));
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const openEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content
    });
    setIsEditAnnouncementOpen(true);
  };

  // Grade functions
  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      const grade = await DataService.createGrade({
        studentId: selectedSubmission.studentId,
        courseId: params.id,
        assignmentId: selectedSubmission.assignmentId,
        points: gradeData.points,
        maxPoints: 100,
        feedback: gradeData.feedback
      });

      if (grade) {
        const updatedSubmissions = submissions.map(sub => 
          sub.id === selectedSubmission.id 
            ? { ...sub, grade: gradeData.points, feedback: gradeData.feedback }
            : sub
        );
        
        setSubmissions(updatedSubmissions);
        setGradeData({ points: 0, feedback: '' });
        setIsGradeDialogOpen(false);
        setSelectedSubmission(null);
      }
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

  // Material functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadMaterial = async () => {
    if (!selectedFile || !materialData.title.trim() || !user) return;

    try {
      const success = await DataService.uploadCourseMaterial(params.id, selectedFile, {
        title: materialData.title,
        description: materialData.description
      }, user.id);

      if (success) {
        setSelectedFile(null);
        setMaterialData({ title: '', description: '' });
        setIsUploadMaterialOpen(false);
        // Refresh materials list
        const materials = await DataService.getCourseMaterials(params.id);
        setCourseMaterials(materials);
      }
    } catch (error) {
      console.error('Error uploading material:', error);
    }
  };

  const handleEditMaterial = (material: CourseMaterial) => {
    setSelectedMaterial(material);
    setMaterialData({
      title: material.title,
      description: material.description || ''
    });
    setIsEditMaterialOpen(true);
  };

  const handleUpdateMaterial = async () => {
    if (!selectedMaterial || !materialData.title.trim()) return;

    try {
      const updatedMaterial = await DataService.updateCourseMaterial(selectedMaterial.id, {
        title: materialData.title,
        description: materialData.description
      });

      if (updatedMaterial) {
        setCourseMaterials(materials => 
          materials.map(m => m.id === selectedMaterial.id ? updatedMaterial : m)
        );
        setMaterialData({ title: '', description: '' });
        setIsEditMaterialOpen(false);
        setSelectedMaterial(null);
      }
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const success = await DataService.deleteCourseMaterial(materialId);
      if (success) {
        setCourseMaterials(materials => materials.filter(m => m.id !== materialId));
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleDownloadMaterial = async (materialId: string) => {
    try {
      const blob = await DataService.downloadCourseMaterial(materialId);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `material-${materialId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading material:', error);
    }
  };

  // Course edit functions
  const openEditCourse = () => {
    if (course) {
      setCourseEditData({
        title: course.title,
        description: course.description,
        coverImage: course.coverImage || '',
        credits: course.credits || 3,
        capacity: course.capacity || 0,
        classNumber: course.classNumber || ''
      });
      setIsEditCourseOpen(true);
    }
  };

  const handleUpdateCourse = async () => {
    if (!course) return;

    try {
      const updatedCourse = await DataService.updateCourse(course.id, {
        title: courseEditData.title,
        description: courseEditData.description,
        coverImage: courseEditData.coverImage || undefined,
        credits: courseEditData.credits,
        capacity: courseEditData.capacity || undefined,
        classNumber: courseEditData.classNumber || undefined
      });

      if (updatedCourse) {
        setCourse(updatedCourse);
        setIsEditCourseOpen(false);
        setImageError(false); // Reset image error state
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  // Helper functions
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
            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading course management...</p>
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
            <p className="text-gray-600">You don't have permission to manage this course.</p>
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
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64 h-36 bg-gray-200 rounded-lg overflow-hidden">
              {course.coverImage && !imageError ? (
                <img 
                  src={course.coverImage} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
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
                
                <div className="flex space-x-2">
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Course
                    </Button>
                  </Link>
                  <Button onClick={openEditCourse}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{course.enrolledStudents.length}</div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{assignments.length}</div>
                        <div className="text-sm text-gray-600">Assignments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{courseMaterials.length}</div>
                        <div className="text-sm text-gray-600">Materials</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{announcements.length}</div>
                        <div className="text-sm text-gray-600">Announcements</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                        <p className="text-xs text-gray-600">3 new students enrolled</p>
                      </div>
                      <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setIsCreateAssignmentOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Assignment
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setIsUploadMaterialOpen(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Material
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setIsCreateAnnouncementOpen(true)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Post Announcement
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Grades
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Course Materials</h2>
              <Button onClick={() => setIsUploadMaterialOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Material
              </Button>
            </div>
            
            <div className="grid gap-4">
              {courseMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{material.title}</h4>
                          <p className="text-sm text-gray-600">
                            {material.fileSize > 1024 * 1024 
                              ? `${(material.fileSize / (1024 * 1024)).toFixed(1)} MB`
                              : `${(material.fileSize / 1024).toFixed(1)} KB`
                            } • {material.fileType}
                          </p>
                          <p className="text-xs text-gray-500">Uploaded {new Date(material.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditMaterial(material)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadMaterial(material.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {courseMaterials.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 mb-4">No materials uploaded yet</p>
                  <Button onClick={() => setIsUploadMaterialOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload First Material
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Assignments</h2>
              <Button onClick={() => setIsCreateAssignmentOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </div>
            
            <div className="grid gap-4">
              {assignments.map((assignment) => {
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
                            <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={isOverdue ? "destructive" : "default"}>
                            {isOverdue ? 'Overdue' : `${daysUntilDue} days left`}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button size="sm">
                              View Submissions
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {assignments.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 mb-4">No assignments created yet</p>
                  <Button onClick={() => setIsCreateAssignmentOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Assignment
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="grades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Grades & Submissions</h2>
              <Button>
                <BarChart3 className="mr-2 h-4 w-4" />
                Export Grades
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Grade Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                    <div className="text-sm text-blue-600">Total Submissions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{gradedSubmissions.length}</div>
                    <div className="text-sm text-green-600">Graded</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{pendingSubmissions.length}</div>
                    <div className="text-sm text-orange-600">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
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
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Announcements</h2>
              <Button onClick={() => setIsCreateAnnouncementOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Post Announcement
              </Button>
            </div>
            
            <div className="grid gap-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <span>{announcement.title}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openEditAnnouncement(announcement)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
              
              {announcements.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600">No announcements yet</p>
                    <Button className="mt-4" onClick={() => setIsCreateAnnouncementOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Post First Announcement
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Assignment Dialog */}
        <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Enter assignment title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Enter assignment description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxPoints">Max Points</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    value={newAssignment.maxPoints}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxPoints: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateAssignmentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment}>
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Announcement Dialog */}
        <Dialog open={isCreateAnnouncementOpen} onOpenChange={setIsCreateAnnouncementOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="announcement-title">Announcement Title</Label>
                <Input
                  id="announcement-title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="announcement-content">Content</Label>
                <Textarea
                  id="announcement-content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Enter announcement content..."
                  rows={6}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateAnnouncementOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement}>
                <Send className="mr-2 h-4 w-4" />
                Post Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Announcement Dialog */}
        <Dialog open={isEditAnnouncementOpen} onOpenChange={setIsEditAnnouncementOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Announcement Title</Label>
                <Input
                  id="edit-title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Enter announcement content..."
                  rows={6}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditAnnouncementOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAnnouncement}>
                <Edit className="mr-2 h-4 w-4" />
                Update Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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

        {/* Upload Material Dialog */}
        <Dialog open={isUploadMaterialOpen} onOpenChange={setIsUploadMaterialOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Course Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click to select a file
                      </p>
                      <Input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm">
                          Choose File
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-title">Title *</Label>
                <Input
                  id="material-title"
                  value={materialData.title}
                  onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
                  placeholder="Enter material title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material-description">Description</Label>
                <Textarea
                  id="material-description"
                  value={materialData.description}
                  onChange={(e) => setMaterialData({ ...materialData, description: e.target.value })}
                  placeholder="Enter material description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadMaterialOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUploadMaterial}
                disabled={!selectedFile || !materialData.title.trim()}
              >
                Upload Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Material Dialog */}
        <Dialog open={isEditMaterialOpen} onOpenChange={setIsEditMaterialOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Course Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-material-title">Title *</Label>
                <Input
                  id="edit-material-title"
                  value={materialData.title}
                  onChange={(e) => setMaterialData({ ...materialData, title: e.target.value })}
                  placeholder="Enter material title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-material-description">Description</Label>
                <Textarea
                  id="edit-material-description"
                  value={materialData.description}
                  onChange={(e) => setMaterialData({ ...materialData, description: e.target.value })}
                  placeholder="Enter material description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditMaterialOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateMaterial}
                disabled={!materialData.title.trim()}
              >
                Update Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Assignment Dialog */}
        <Dialog open={isCreateAssignmentOpen} onOpenChange={setIsCreateAssignmentOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Enter assignment title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Enter assignment description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxPoints">Max Points</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    value={newAssignment.maxPoints}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxPoints: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateAssignmentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment}>
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Announcement Dialog */}
        <Dialog open={isCreateAnnouncementOpen} onOpenChange={setIsCreateAnnouncementOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="announcement-title">Announcement Title</Label>
                <Input
                  id="announcement-title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="announcement-content">Content</Label>
                <Textarea
                  id="announcement-content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Enter announcement content..."
                  rows={6}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateAnnouncementOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement}>
                <Send className="mr-2 h-4 w-4" />
                Post Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Announcement Dialog */}
        <Dialog open={isEditAnnouncementOpen} onOpenChange={setIsEditAnnouncementOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Announcement Title</Label>
                <Input
                  id="edit-title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Enter announcement content..."
                  rows={6}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditAnnouncementOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAnnouncement}>
                <Edit className="mr-2 h-4 w-4" />
                Update Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Course Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="course-title">Course Title</Label>
                <Input
                  id="course-title"
                  value={courseEditData.title}
                  onChange={(e) => setCourseEditData({ ...courseEditData, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="course-description">Description</Label>
                <Textarea
                  id="course-description"
                  value={courseEditData.description}
                  onChange={(e) => setCourseEditData({ ...courseEditData, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="course-cover-image">Cover Image URL</Label>
                <Input
                  id="course-cover-image"
                  value={courseEditData.coverImage}
                  onChange={(e) => setCourseEditData({ ...courseEditData, coverImage: e.target.value })}
                  placeholder="Enter cover image URL (optional)"
                />
                {courseEditData.coverImage && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-600">Preview:</Label>
                    <div className="mt-1 w-32 h-20 bg-gray-200 rounded overflow-hidden">
                      <img 
                        src={courseEditData.coverImage} 
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs hidden">
                        Invalid URL
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="course-credits">Credits</Label>
                  <Input
                    id="course-credits"
                    type="number"
                    value={courseEditData.credits}
                    onChange={(e) => setCourseEditData({ ...courseEditData, credits: parseInt(e.target.value) || 3 })}
                    min="1"
                    max="6"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course-capacity">Capacity</Label>
                  <Input
                    id="course-capacity"
                    type="number"
                    value={courseEditData.capacity}
                    onChange={(e) => setCourseEditData({ ...courseEditData, capacity: parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="No limit"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course-class-number">Class Number</Label>
                  <Input
                    id="course-class-number"
                    value={courseEditData.classNumber}
                    onChange={(e) => setCourseEditData({ ...courseEditData, classNumber: e.target.value })}
                    placeholder="e.g., CS101"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditCourseOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCourse}>
                <Edit className="mr-2 h-4 w-4" />
                Update Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

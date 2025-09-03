'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Course, Grade } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function AdminDashboard() {
  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  };

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [degreePrograms, setDegreePrograms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isAddDegreeProgramDialogOpen, setIsAddDegreeProgramDialogOpen] = useState(false);
  const [isEditGradeDialogOpen, setIsEditGradeDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'user' | 'course' | 'degree-program' | null;
    id: string | null;
    name: string | null;
  }>({
    open: false,
    type: null,
    id: null,
    name: null,
  });
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'TEACHER' | 'ADMIN'
  });

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructorId: '',
    credits: 3,
    capacity: 30,
    classNumber: '',
    schedule: {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:30',
      room: ''
    }
  });

  const [newDegreeProgram, setNewDegreeProgram] = useState({
    name: '',
    description: '',
    totalCreditsRequired: 120
  });

  const [editGrade, setEditGrade] = useState({
    points: 0,
    feedback: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, coursesRes, gradesRes, degreeProgramsRes, teachersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/grades'),
        fetch('/api/admin/degree-programs'),
        fetch('/api/admin/users?role=TEACHER')
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to load users:', usersRes.status);
      }

      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      } else {
        console.error('Failed to load courses:', coursesRes.status);
      }

      if (gradesRes.ok) {
        const data = await gradesRes.json();
        setGrades(data.grades || []);
      } else {
        console.error('Failed to load grades:', gradesRes.status);
      }

      if (degreeProgramsRes.ok) {
        const data = await degreeProgramsRes.json();
        setDegreePrograms(data.degreePrograms || []);
      } else {
        console.error('Failed to load degree programs:', degreeProgramsRes.status);
      }

      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data.users || []);
      } else {
        console.error('Failed to load teachers:', teachersRes.status);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast({ title: "Success", description: "User created successfully" });
        setIsAddUserDialogOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'STUDENT' });
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCourse = async () => {
    // Validate form
    if (!newCourse.title || !newCourse.description || !newCourse.instructorId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Course created successfully" });
        setIsAddCourseDialogOpen(false);
        setNewCourse({ 
          title: '', 
          description: '', 
          instructorId: '', 
          credits: 3, 
          capacity: 30, 
          classNumber: '', 
          schedule: {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '10:30',
            room: ''
          }
        });
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({ title: "Error", description: "Failed to create course", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDegreeProgram = async () => {
    // Validate form
    if (!newDegreeProgram.name || !newDegreeProgram.totalCreditsRequired) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/degree-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDegreeProgram),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Degree program created successfully" });
        setIsAddDegreeProgramDialogOpen(false);
        setNewDegreeProgram({ name: '', description: '', totalCreditsRequired: 120 });
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to create degree program",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating degree program:', error);
      toast({ title: "Error", description: "Failed to create degree program", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGrade = async () => {
    if (!selectedGrade) return;

    // Validate grade
    if (editGrade.points < 0 || editGrade.points > selectedGrade.maxPoints) {
      toast({
        title: "Error",
        description: `Points must be between 0 and ${selectedGrade.maxPoints}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/grades/${selectedGrade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editGrade),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Grade updated successfully" });
        setIsEditGradeDialogOpen(false);
        setSelectedGrade(null);
        setEditGrade({ points: 0, feedback: '' });
        loadData();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to update grade",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update grade", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadGrades = async () => {
    try {
      const response = await fetch('/api/admin/grades/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student-grades.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: "Success", description: "Grades downloaded successfully" });
      } else {
        toast({ title: "Error", description: "Failed to download grades", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to download grades", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return;

    setIsSubmitting(true);
    try {
      let endpoint = '';
      switch (deleteDialog.type) {
        case 'user':
          endpoint = `/api/admin/users?id=${deleteDialog.id}`;
          break;
        case 'course':
          endpoint = `/api/admin/courses?id=${deleteDialog.id}`;
          break;
        case 'degree-program':
          endpoint = `/api/admin/degree-programs?id=${deleteDialog.id}`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        toast({ 
          title: "Success", 
          description: data.message || `${deleteDialog.type} deleted successfully` 
        });
        setDeleteDialog({ open: false, type: null, id: null, name: null });
        loadData();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || `Failed to delete ${deleteDialog.type}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({ 
        title: "Error", 
        description: `Failed to delete ${deleteDialog.type}`, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (type: 'user' | 'course' | 'degree-program', id: string, name: string) => {
    setDeleteDialog({
      open: true,
      type,
      id,
      name,
    });
  };

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={downloadGrades}>Download All Grades</Button>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account with specified role.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: 'STUDENT' | 'TEACHER' | 'ADMIN') => 
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddCourseDialogOpen} onOpenChange={setIsAddCourseDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Course</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>Create a new course with an instructor.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="courseTitle">Title</Label>
                  <Input
                    id="courseTitle"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="courseDescription">Description</Label>
                  <Textarea
                    id="courseDescription"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Select
                    value={newCourse.instructorId}
                    onValueChange={(value) => setNewCourse({ ...newCourse, instructorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="1"
                    max="6"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={newCourse.capacity}
                    onChange={(e) => setNewCourse({ ...newCourse, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="classNumber">Class Number</Label>
                  <Input
                    id="classNumber"
                    value={newCourse.classNumber}
                    onChange={(e) => setNewCourse({ ...newCourse, classNumber: e.target.value })}
                    placeholder="e.g., CS101, MATH201"
                  />
                </div>
                <div>
                  <Label htmlFor="dayOfWeek">Day of Week</Label>
                  <Select
                    value={newCourse.schedule.dayOfWeek.toString()}
                    onValueChange={(value) => setNewCourse({ 
                      ...newCourse, 
                      schedule: { ...newCourse.schedule, dayOfWeek: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newCourse.schedule.startTime}
                    onChange={(e) => setNewCourse({ 
                      ...newCourse, 
                      schedule: { ...newCourse.schedule, startTime: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newCourse.schedule.endTime}
                    onChange={(e) => setNewCourse({ 
                      ...newCourse, 
                      schedule: { ...newCourse.schedule, endTime: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    value={newCourse.schedule.room}
                    onChange={(e) => setNewCourse({ 
                      ...newCourse, 
                      schedule: { ...newCourse.schedule, room: e.target.value }
                    })}
                    placeholder="e.g., CS-101, Room 201"
                  />
                </div>
                <Button onClick={handleAddCourse} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDegreeProgramDialogOpen} onOpenChange={setIsAddDegreeProgramDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Degree Program</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Degree Program</DialogTitle>
                <DialogDescription>Create a new degree program with requirements.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="programName">Program Name</Label>
                  <Input
                    id="programName"
                    value={newDegreeProgram.name}
                    onChange={(e) => setNewDegreeProgram({ ...newDegreeProgram, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="programDescription">Description</Label>
                  <Textarea
                    id="programDescription"
                    value={newDegreeProgram.description}
                    onChange={(e) => setNewDegreeProgram({ ...newDegreeProgram, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="totalCredits">Total Credits Required</Label>
                  <Input
                    id="totalCredits"
                    type="number"
                    min="60"
                    max="200"
                    value={newDegreeProgram.totalCreditsRequired}
                    onChange={(e) => setNewDegreeProgram({ ...newDegreeProgram, totalCreditsRequired: parseInt(e.target.value) })}
                  />
                </div>
                <Button onClick={handleAddDegreeProgram} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Degree Program'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="degree-programs">Degree Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Admins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="destructive">ADMIN</Badge>
                Administrators
              </CardTitle>
              <CardDescription>System administrators with full access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter((user: any) => user.role === 'ADMIN').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        No administrators found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter((user: any) => user.role === 'ADMIN').map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name || 'Unknown'}</TableCell>
                        <TableCell>{user.email || 'No email'}</TableCell>
                        <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Teachers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">TEACHER</Badge>
                Teachers
              </CardTitle>
              <CardDescription>Course instructors and educators</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter((user: any) => user.role === 'TEACHER').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No teachers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter((user: any) => user.role === 'TEACHER').map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name || 'Unknown'}</TableCell>
                        <TableCell>{user.email || 'No email'}</TableCell>
                        <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog('user', user.id, user.name || 'Unknown')}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default">STUDENT</Badge>
                Students
              </CardTitle>
              <CardDescription>Enrolled students in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter((user: any) => user.role === 'STUDENT').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.filter((user: any) => user.role === 'STUDENT').map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name || 'Unknown'}</TableCell>
                        <TableCell>{user.email || 'No email'}</TableCell>
                        <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog('user', user.id, user.name || 'Unknown')}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Overview of all courses in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No courses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    courses.map((course: any) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.classNumber || 'N/A'}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.instructor?.name || 'Unknown'}</TableCell>
                        <TableCell>{course.enrolledStudents?.length || 0}</TableCell>
                        <TableCell>{course.credits || 3}</TableCell>
                        <TableCell>
                          {course.schedule ? (
                            <div className="text-sm">
                              <div>{getDayName(course.schedule.dayOfWeek)}</div>
                              <div>{course.schedule.startTime} - {course.schedule.endTime}</div>
                              <div className="text-gray-500">{course.schedule.room}</div>
                            </div>
                          ) : 'No schedule'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog('course', course.id, course.title)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Management</CardTitle>
              <CardDescription>View and edit student grades</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No grades found
                      </TableCell>
                    </TableRow>
                  ) : (
                    grades.map((grade: any) => (
                      <TableRow key={grade.id}>
                        <TableCell>{grade.student?.name || grade.studentId}</TableCell>
                        <TableCell>{grade.assignment?.course?.title || grade.courseId}</TableCell>
                        <TableCell>{grade.assignment?.title || grade.assignmentId}</TableCell>
                        <TableCell>
                          {grade.points}/{grade.maxPoints}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedGrade(grade);
                              setEditGrade({
                                points: grade.points,
                                feedback: grade.feedback || ''
                              });
                              setIsEditGradeDialogOpen(true);
                            }}
                          >
                            Edit Grade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="degree-programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Degree Program Management</CardTitle>
              <CardDescription>Manage degree programs and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Required Credits</TableHead>
                    <TableHead>Requirements</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {degreePrograms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No degree programs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    degreePrograms.map((program: any) => (
                      <TableRow key={program.id}>
                        <TableCell>{program.name}</TableCell>
                        <TableCell>{program.description || 'No description'}</TableCell>
                        <TableCell>{program.totalCreditsRequired}</TableCell>
                        <TableCell>{program.requirements?.length || 0} categories</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog('degree-program', program.id, program.name)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Grade Dialog */}
      <Dialog open={isEditGradeDialogOpen} onOpenChange={setIsEditGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
            <DialogDescription>
              Update the grade and feedback for this submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={editGrade.points}
                onChange={(e) => setEditGrade({ ...editGrade, points: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={editGrade.feedback}
                onChange={(e) => setEditGrade({ ...editGrade, feedback: e.target.value })}
              />
            </div>
            <Button onClick={handleEditGrade} className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Grade'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={`Delete ${deleteDialog.type === 'user' ? 'User' : deleteDialog.type === 'course' ? 'Course' : 'Degree Program'}`}
        description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

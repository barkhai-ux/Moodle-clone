import { Course, Assignment, Grade, Announcement, User, CourseMaterial } from '@/types';

export class DataService {
  static async getCourses(params?: { instructorId?: string; studentId?: string }): Promise<Course[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.instructorId) searchParams.append('instructorId', params.instructorId);
      if (params?.studentId) searchParams.append('studentId', params.studentId);

      const response = await fetch(`/api/courses?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      
      const data = await response.json();
      return data.courses || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  static async getAssignments(params?: { courseId?: string; instructorId?: string }): Promise<Assignment[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.courseId) searchParams.append('courseId', params.courseId);
      if (params?.instructorId) searchParams.append('instructorId', params.instructorId);

      const response = await fetch(`/api/assignments?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch assignments');
      
      const data = await response.json();
      return data.assignments || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  static async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment | null> {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });

      if (!response.ok) throw new Error('Failed to create assignment');
      
      const data = await response.json();
      return data.assignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      return null;
    }
  }

  static async updateAssignment(assignmentId: string, updates: Partial<Assignment>): Promise<Assignment | null> {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update assignment');
      
      const data = await response.json();
      return data.assignment;
    } catch (error) {
      console.error('Error updating assignment:', error);
      return null;
    }
  }

  static async deleteAssignment(assignmentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete assignment');
      
      return true;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return false;
    }
  }

  static async getGrades(params?: { studentId?: string; courseId?: string; assignmentId?: string }): Promise<Grade[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.studentId) searchParams.append('studentId', params.studentId);
      if (params?.courseId) searchParams.append('courseId', params.courseId);
      if (params?.assignmentId) searchParams.append('assignmentId', params.assignmentId);

      const response = await fetch(`/api/grades?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch grades');
      
      const data = await response.json();
      return data.grades || [];
    } catch (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
  }

  static async createGrade(grade: Omit<Grade, 'id' | 'gradedAt'>): Promise<Grade | null> {
    try {
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(grade),
      });

      if (!response.ok) throw new Error('Failed to create grade');
      
      const data = await response.json();
      return data.grade;
    } catch (error) {
      console.error('Error creating grade:', error);
      return null;
    }
  }

  static async updateGrade(gradeId: string, updates: Partial<Grade>): Promise<Grade | null> {
    try {
      const response = await fetch(`/api/grades/${gradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update grade');
      
      const data = await response.json();
      return data.grade;
    } catch (error) {
      console.error('Error updating grade:', error);
      return null;
    }
  }

  static async getAnnouncements(params?: { courseId?: string; authorId?: string }): Promise<Announcement[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.courseId) searchParams.append('courseId', params.courseId);
      if (params?.authorId) searchParams.append('authorId', params.authorId);

      const response = await fetch(`/api/announcements?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch announcements');
      
      const data = await response.json();
      return data.announcements || [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  }

  static async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement | null> {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcement),
      });

      if (!response.ok) throw new Error('Failed to create announcement');
      
      const data = await response.json();
      return data.announcement;
    } catch (error) {
      console.error('Error creating announcement:', error);
      return null;
    }
  }

  static async updateAnnouncement(announcementId: string, updates: Partial<Announcement>): Promise<Announcement | null> {
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update announcement');
      
      const data = await response.json();
      return data.announcement;
    } catch (error) {
      console.error('Error updating announcement:', error);
      return null;
    }
  }

  static async deleteAnnouncement(announcementId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete announcement');
      
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return false;
    }
  }

  static async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      
      const data = await response.json();
      return data.course || null;
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      return null;
    }
  }

  static async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course | null> {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update course');
      
      const data = await response.json();
      return data.course;
    } catch (error) {
      console.error('Error updating course:', error);
      return null;
    }
  }

  static async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    try {
      const assignments = await this.getAssignments();
      return assignments.find(assignment => assignment.id === assignmentId) || null;
    } catch (error) {
      console.error('Error fetching assignment by ID:', error);
      return null;
    }
  }

  static async updateUserProfile(updates: { avatar?: string }, userId: string): Promise<User | null> {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updates, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Course Materials Management
  static async uploadCourseMaterial(courseId: string, file: File, metadata: { title: string; description?: string }, uploadedBy: string): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseId', courseId);
      formData.append('title', metadata.title);
      formData.append('uploadedBy', uploadedBy);
      if (metadata.description) {
        formData.append('description', metadata.description);
      }

      const response = await fetch('/api/courses/materials', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload material');
      
      return true;
    } catch (error) {
      console.error('Error uploading course material:', error);
      return false;
    }
  }

  static async getCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
    try {
      const response = await fetch(`/api/courses/materials?courseId=${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      
      const data = await response.json();
      return data.materials || [];
    } catch (error) {
      console.error('Error fetching course materials:', error);
      return [];
    }
  }

  static async updateCourseMaterial(materialId: string, updates: { title: string; description?: string }): Promise<CourseMaterial | null> {
    try {
      const response = await fetch(`/api/courses/materials/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update material');
      
      const data = await response.json();
      return data.material;
    } catch (error) {
      console.error('Error updating course material:', error);
      return null;
    }
  }

  static async deleteCourseMaterial(materialId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/courses/materials/${materialId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete material');
      
      return true;
    } catch (error) {
      console.error('Error deleting course material:', error);
      return false;
    }
  }

  static async downloadCourseMaterial(materialId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`/api/courses/materials/${materialId}/download`);
      if (!response.ok) throw new Error('Failed to download material');
      
      return await response.blob();
    } catch (error) {
      console.error('Error downloading course material:', error);
      return null;
    }
  }

  // Export grades functionality
  static async exportGrades(courseId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob | null> {
    try {
      const response = await fetch(`/api/grades/export?courseId=${courseId}&format=${format}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Failed to export grades');
      
      return await response.blob();
    } catch (error) {
      console.error('Error exporting grades:', error);
      return null;
    }
  }

  // Admin course management methods
  static async getAllCourses(): Promise<Course[]> {
    try {
      const response = await fetch('/api/admin/courses');
      if (!response.ok) throw new Error('Failed to fetch all courses');
      
      const data = await response.json();
      return data.courses || [];
    } catch (error) {
      console.error('Error fetching all courses:', error);
      return [];
    }
  }

  static async getAvailableCourses(): Promise<Course[]> {
    try {
      const response = await fetch('/api/courses?available=true');
      if (!response.ok) throw new Error('Failed to fetch available courses');
      
      const data = await response.json();
      return data.courses || [];
    } catch (error) {
      console.error('Error fetching available courses:', error);
      return [];
    }
  }

  static async updateCourseAvailability(courseId: string, isAvailable: boolean): Promise<Course | null> {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailableForEnrollment: isAvailable }),
      });

      if (!response.ok) throw new Error('Failed to update course availability');
      
      const data = await response.json();
      return data.course;
    } catch (error) {
      console.error('Error updating course availability:', error);
      return null;
    }
  }

  static async bulkUpdateCourseAvailability(courseIds: string[], isAvailable: boolean): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/courses/bulk-availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseIds, isAvailableForEnrollment: isAvailable }),
      });

      if (!response.ok) throw new Error('Failed to update course availability');
      
      return true;
    } catch (error) {
      console.error('Error updating course availability:', error);
      return false;
    }
  }
}

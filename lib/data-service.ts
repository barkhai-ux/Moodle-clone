import { Course, Assignment, Grade, Announcement, User } from '@/types';

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

  static async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const courses = await this.getCourses();
      return courses.find(course => course.id === courseId) || null;
    } catch (error) {
      console.error('Error fetching course by ID:', error);
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
}

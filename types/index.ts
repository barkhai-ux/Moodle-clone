export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatar?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: User;
  enrolledStudents: User[];
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  schedules?: CourseSchedule[];
  credits?: number;
  capacity?: number;
  classNumber?: string;
  prerequisites?: string[];
  isAvailableForEnrollment?: boolean;
}

export interface CourseSchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  room?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  points: number;
  maxPoints: number;
  feedback?: string;
  gradedAt: string;
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DegreeRequirement {
  id: string;
  category: string;
  categoryName: string;
  requiredCredits: number;
  completedCredits: number;
  courses: string[]; // Course IDs that satisfy this requirement
  description?: string;
}

export interface DegreeProgram {
  id: string;
  name: string;
  totalCreditsRequired: number;
  requirements: DegreeRequirement[];
  description?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'DIRECT' | 'GROUP' | 'COURSE';
  courseId?: string;
  createdAt: string;
  updatedAt: string;
  course?: Course;
  members: ChatMember[];
  messages: ChatMessage[];
}

export interface ChatMember {
  id: string;
  userId: string;
  chatId: string;
  joinedAt: string;
  isActive: boolean;
  user: User;
  chat: ChatRoom;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
  deletedById?: string;
  sender: User;
  room: ChatRoom;
  readReceipts?: ReadReceipt[];
}

export interface ReadReceipt {
  id: string;
  messageId: string;
  userId: string;
  createdAt: string;
  user?: User;
}

// Keep the old interface for backward compatibility
export interface ChatMessage extends Message {
  chatId: string;
  content: string;
  messageType: 'TEXT' | 'FILE' | 'IMAGE';
  updatedAt: string;
  chat: ChatRoom;
}
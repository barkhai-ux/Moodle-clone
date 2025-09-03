import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const teacherPassword = await bcrypt.hash('password123', 10);
  const studentPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('password123', 10);

  // Create test users
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      password: teacherPassword,
      name: 'Dr. Sarah Johnson',
      role: 'TEACHER',
      avatar: 'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      password: studentPassword,
      name: 'Alex Smith',
      role: 'STUDENT',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    },
  });

  // Create some test courses
  const course1 = await prisma.course.upsert({
    where: { id: 'course1' },
    update: {},
    create: {
      id: 'course1',
      title: 'Introduction to Computer Science',
      description: 'Learn the fundamentals of computer science and programming.',
      coverImage: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
      credits: 3,
      capacity: 30,
      classNumber: 'CS101',
      instructorId: teacher.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 'course2' },
    update: {},
    create: {
      id: 'course2',
      title: 'Advanced Mathematics',
      description: 'Advanced mathematical concepts and problem-solving techniques.',
      coverImage: 'https://images.pexels.com/photos/590570/pexels-photo-590570.jpeg',
      credits: 4,
      capacity: 25,
      classNumber: 'MATH201',
      instructorId: teacher.id,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { id: 'course3' },
    update: {},
    create: {
      id: 'course3',
      title: 'Web Development Fundamentals',
      description: 'Learn HTML, CSS, JavaScript, and modern web development practices.',
      coverImage: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg',
      credits: 3,
      capacity: 25,
      classNumber: 'CS201',
      instructorId: teacher.id,
    },
  });

  const course4 = await prisma.course.upsert({
    where: { id: 'course4' },
    update: {},
    create: {
      id: 'course4',
      title: 'Data Structures and Algorithms',
      description: 'Advanced data structures, algorithm design, and complexity analysis.',
      coverImage: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
      credits: 4,
      capacity: 20,
      classNumber: 'CS301',
      instructorId: teacher.id,
    },
  });

  // Create course schedules
  await prisma.courseSchedule.upsert({
    where: { courseId: course1.id },
    update: {},
    create: {
      courseId: course1.id,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '10:30',
      room: 'CS-101',
    },
  });

  await prisma.courseSchedule.upsert({
    where: { courseId: course2.id },
    update: {},
    create: {
      courseId: course2.id,
      dayOfWeek: 2, // Tuesday
      startTime: '10:00',
      endTime: '11:30',
      room: 'CS-201',
    },
  });

  await prisma.courseSchedule.upsert({
    where: { courseId: course3.id },
    update: {},
    create: {
      courseId: course3.id,
      dayOfWeek: 3, // Wednesday
      startTime: '14:00',
      endTime: '15:30',
      room: 'CS-102',
    },
  });

  await prisma.courseSchedule.upsert({
    where: { courseId: course4.id },
    update: {},
    create: {
      courseId: course4.id,
      dayOfWeek: 4, // Thursday
      startTime: '11:00',
      endTime: '12:30',
      room: 'CS-202',
    },
  });

  // Enroll student in courses
  await prisma.enrollment.upsert({
    where: { 
      studentId_courseId: {
        studentId: student.id,
        courseId: course1.id,
      }
    },
    update: {},
    create: {
      studentId: student.id,
      courseId: course1.id,
    },
  });

  // Create test assignments
  const assignment1 = await prisma.assignment.upsert({
    where: { id: 'assignment1' },
    update: {},
    create: {
      id: 'assignment1',
      courseId: course1.id,
      instructorId: teacher.id,
      title: 'Algorithm Design Project',
      description: 'Design and implement a sorting algorithm with time complexity analysis.',
      dueDate: new Date('2024-02-15T23:59:00Z'),
      maxPoints: 100,
    },
  });

  const assignment2 = await prisma.assignment.upsert({
    where: { id: 'assignment2' },
    update: {},
    create: {
      id: 'assignment2',
      courseId: course3.id,
      instructorId: teacher.id,
      title: 'Portfolio Website',
      description: 'Create a responsive personal portfolio website using HTML, CSS, and JavaScript.',
      dueDate: new Date('2024-02-20T23:59:00Z'),
      maxPoints: 150,
    },
  });

  const assignment3 = await prisma.assignment.upsert({
    where: { id: 'assignment3' },
    update: {},
    create: {
      id: 'assignment3',
      courseId: course2.id,
      instructorId: teacher.id,
      title: 'Calculus Problem Set',
      description: 'Complete the advanced calculus problem set covering derivatives and integrals.',
      dueDate: new Date('2024-02-25T23:59:00Z'),
      maxPoints: 100,
    },
  });

  const assignment4 = await prisma.assignment.upsert({
    where: { id: 'assignment4' },
    update: {},
    create: {
      id: 'assignment4',
      courseId: course4.id,
      instructorId: teacher.id,
      title: 'Algorithm Implementation',
      description: 'Implement and analyze sorting algorithms with time complexity analysis.',
      dueDate: new Date('2024-03-01T23:59:00Z'),
      maxPoints: 120,
    },
  });

  // Create test grades
  await prisma.grade.upsert({
    where: { id: 'grade1' },
    update: {},
    create: {
      id: 'grade1',
      assignmentId: assignment1.id,
      studentId: student.id,
      points: 85,
      maxPoints: 100,
      feedback: 'Excellent work on the algorithm implementation. Consider optimizing the space complexity.',
    },
  });

  // Create test announcements
  await prisma.announcement.upsert({
    where: { id: 'announcement1' },
    update: {},
    create: {
      id: 'announcement1',
      courseId: course1.id,
      authorId: teacher.id,
      title: 'Midterm Exam Schedule',
      content: 'The midterm exam will be held on February 25th at 2:00 PM in Room 101.',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Test users created:');
  console.log(`- Teacher: teacher@example.com (password: password123)`);
  console.log(`- Student: student@example.com (password: password123)`);
  console.log(`- Admin: admin@example.com (password: password123)`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

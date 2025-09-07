import { PrismaClient } from '@prisma/client';
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
      isAvailableForEnrollment: true,
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
      isAvailableForEnrollment: false,
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
      isAvailableForEnrollment: true,
    },
  });

  const course5 = await prisma.course.upsert({
    where: { id: 'course5' },
    update: {},
    create: {
      id: 'course5',
      title: 'Basics of Management',
      description: 'Introduction to management principles and organizational behavior.',
      coverImage: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
      credits: 3,
      capacity: 35,
      classNumber: 'BUS101',
      instructorId: teacher.id,
      isAvailableForEnrollment: true,
    },
  });

  const course6 = await prisma.course.upsert({
    where: { id: 'course6' },
    update: {},
    create: {
      id: 'course6',
      title: 'College Algebra',
      description: 'Fundamental algebraic concepts and problem-solving techniques.',
      coverImage: 'https://images.pexels.com/photos/590570/pexels-photo-590570.jpeg',
      credits: 3,
      capacity: 40,
      classNumber: 'MATH101',
      instructorId: teacher.id,
      isAvailableForEnrollment: true,
    },
  });

  const course7 = await prisma.course.upsert({
    where: { id: 'course7' },
    update: {},
    create: {
      id: 'course7',
      title: 'Business Ethics',
      description: 'Ethical decision-making in business contexts.',
      coverImage: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
      credits: 3,
      capacity: 30,
      classNumber: 'BUS201',
      instructorId: teacher.id,
      isAvailableForEnrollment: true,
    },
  });

  const course8 = await prisma.course.upsert({
    where: { id: 'course8' },
    update: {},
    create: {
      id: 'course8',
      title: 'Statistics for Business',
      description: 'Statistical methods and their applications in business.',
      coverImage: 'https://images.pexels.com/photos/590570/pexels-photo-590570.jpeg',
      credits: 4,
      capacity: 25,
      classNumber: 'STAT201',
      instructorId: teacher.id,
      isAvailableForEnrollment: true,
    },
  });

  const course9 = await prisma.course.upsert({
    where: { id: 'course9' },
    update: {},
    create: {
      id: 'course9',
      title: 'Database Systems',
      description: 'Introduction to database design and management.',
      coverImage: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
      credits: 3,
      capacity: 25,
      classNumber: 'CS401',
      instructorId: teacher.id,
      isAvailableForEnrollment: true,
    },
  });

  const course10 = await prisma.course.upsert({
    where: { id: 'course10' },
    update: {},
    create: {
      id: 'course10',
      title: 'Marketing Principles',
      description: 'Fundamental marketing concepts and strategies.',
      coverImage: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
      credits: 3,
      capacity: 30,
      classNumber: 'BUS301',
      instructorId: teacher.id,
      isAvailableForEnrollment: true,
    },
  });

  const course11 = await prisma.course.upsert({
    where: { id: 'course11' },
    update: {},
    create: {
      id: 'course11',
      title: 'Introduction to Psychology',
      description: 'Basic principles of psychology and human behavior.',
      coverImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      credits: 3,
      capacity: 35,
      classNumber: 'PSY101',
      instructorId: teacher.id,
      isAvailableForEnrollment: true,
    },
  });

  const course12 = await prisma.course.upsert({
    where: { id: 'course12' },
    update: {},
    create: {
      id: 'course12',
      title: 'Physical Chemistry',
      description: 'Advanced chemistry concepts with mathematical foundations.',
      coverImage: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
      credits: 4,
      capacity: 20,
      classNumber: 'CHEM301',
      instructorId: teacher.id,
      isAvailableForEnrollment: true,
    },
  });

  // Create course schedules - multiple courses can be in same time slot

  await prisma.courseSchedule.create({
    data: {
      courseId: course2.id,
      dayOfWeek: 2, // Tuesday
      startTime: '08:00',
      endTime: '09:30',
      room: 'CS-102',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course3.id,
      dayOfWeek: 3, // Wednesday
      startTime: '09:40',
      endTime: '11:10',
      room: 'CS-102',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course4.id,
      dayOfWeek: 4, // Thursday
      startTime: '09:40',
      endTime: '11:10',
      room: 'CS-202',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course5.id,
      dayOfWeek: 3, // Wednesday
      startTime: '08:00',
      endTime: '09:30',
      room: 'BUS-201',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course6.id,
      dayOfWeek: 4, // Thursday
      startTime: '08:00',
      endTime: '09:30',
      room: 'MATH-201',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course7.id,
      dayOfWeek: 1, // Monday
      startTime: '09:40',
      endTime: '11:10',
      room: 'BUS-202',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course8.id,
      dayOfWeek: 2, // Tuesday
      startTime: '09:40',
      endTime: '11:10',
      room: 'MATH-202',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course9.id,
      dayOfWeek: 1, // Monday
      startTime: '09:40',
      endTime: '11:10',
      room: 'CS-201',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course10.id,
      dayOfWeek: 2, // Tuesday
      startTime: '09:40',
      endTime: '11:10',
      room: 'BUS-203',
    },
  });

  // Add overlapping courses to demonstrate multiple courses in same time slot
  await prisma.courseSchedule.create({
    data: {
      courseId: course11.id,
      dayOfWeek: 2, // Tuesday - same time as course8 and course10 but different room
      startTime: '09:40',
      endTime: '11:10',
      room: 'PSY-101',
    },
  });

  await prisma.courseSchedule.create({
    data: {
      courseId: course12.id,
      dayOfWeek: 3, // Wednesday - same time as course3 and course5 but different room
      startTime: '09:40',
      endTime: '11:10',
      room: 'CHEM-201',
    },
  });
  
  // Enroll student in courses
  await prisma.enrollment.createMany({
    data: [
      { studentId: student.id, courseId: course2.id },
      { studentId: student.id, courseId: course4.id },
      { studentId: student.id, courseId: course5.id },
      { studentId: student.id, courseId: course6.id },
      { studentId: student.id, courseId: course7.id },
      { studentId: student.id, courseId: course8.id },
      { studentId: student.id, courseId: course9.id },
      { studentId: student.id, courseId: course10.id },
      { studentId: student.id, courseId: course11.id },
      { studentId: student.id, courseId: course12.id },
    ],
    skipDuplicates: true,
  });

  // Create test assignments
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

  // Create test chat rooms
  const chatRoom1 = await prisma.chatRoom.create({
    data: {
      name: 'General Discussion',
      type: 'GROUP',
      members: {
        create: [
          { userId: student.id, isActive: true },
          { userId: teacher.id, isActive: true },
        ],
      },
    },
  });

  const chatRoom2 = await prisma.chatRoom.create({
    data: {
      name: 'Course Discussion',
      type: 'COURSE',
      courseId: course2.id,
      members: {
        create: [
          { userId: student.id, isActive: true },
          { userId: teacher.id, isActive: true },
        ],
      },
    },
  });

  // Create some test messages
  await prisma.message.create({
    data: {
      roomId: chatRoom1.id,
      senderId: teacher.id,
      body: 'Welcome everyone to the general discussion!',
    },
  });

  await prisma.message.create({
    data: {
      roomId: chatRoom1.id,
      senderId: student.id,
      body: 'Hello! I have a question about the course materials.',
    },
  });

  await prisma.message.create({
    data: {
      roomId: chatRoom2.id,
      senderId: teacher.id,
      body: 'This is the course-specific chat for Advanced Mathematics.',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Test users created:');
  console.log(`- Teacher: teacher@example.com (password: password123)`);
  console.log(`- Student: student@example.com (password: password123)`);
  console.log(`- Admin: admin@example.com (password: password123)`);
  console.log('Chat rooms created for testing!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

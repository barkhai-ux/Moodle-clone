import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const studentId = searchParams.get('studentId');

    let whereClause = {};

    if (instructorId) {
      whereClause = { instructorId };
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        schedule: true,
      },
    });

    // Transform the data to match the expected format
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      enrolledStudents: course.enrollments.map(enrollment => enrollment.student),
      coverImage: course.coverImage,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      schedule: course.schedule,
      credits: course.credits,
      capacity: course.capacity,
      prerequisites: [], // This would need to be implemented with a separate table
    }));

    // If studentId is provided, filter to only show courses the student is enrolled in
    if (studentId) {
      const enrolledCourseIds = courses
        .filter(course => course.enrollments.some(enrollment => enrollment.studentId === studentId))
        .map(course => course.id);
      
      return NextResponse.json({ 
        courses: transformedCourses.filter(course => enrolledCourseIds.includes(course.id))
      });
    }

    return NextResponse.json({ courses: transformedCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

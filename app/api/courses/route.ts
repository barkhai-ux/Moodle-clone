import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const studentId = searchParams.get('studentId');
    const available = searchParams.get('available');

    let whereClause = {};

    if (instructorId) {
      whereClause = { ...whereClause, instructorId };
    }

    // Filter by availability if requested
    if (available === 'true') {
      whereClause = { ...whereClause, isAvailableForEnrollment: true };
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
        schedules: true,
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
      schedules: course.schedules,
      credits: course.credits,
      capacity: course.capacity,
      isAvailableForEnrollment: course.isAvailableForEnrollment,
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        schedules: true,
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
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
      classNumber: course.classNumber,
      isAvailableForEnrollment: course.isAvailableForEnrollment,
    }));

    return NextResponse.json({ courses: transformedCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { title, description, instructorId, credits, capacity, coverImage, classNumber, schedule } = await request.json();

    if (!title || !description || !instructorId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, and instructorId are required' },
        { status: 400 }
      );
    }

    // Verify instructor exists and is a teacher
    const instructor = await prisma.user.findFirst({
      where: {
        id: instructorId,
        role: 'TEACHER',
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found or is not a teacher' },
        { status: 400 }
      );
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructorId,
        credits: credits || 3,
        capacity: capacity || null,
        coverImage: coverImage || null,
        classNumber: classNumber || null,
        schedules: schedule ? {
          create: {
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: schedule.room || null,
          }
        } : undefined,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedules: true,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('id');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: true,
        assignments: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course has enrollments
    if (course.enrollments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with enrolled students. Please remove all enrollments first.' },
        { status: 400 }
      );
    }

    // Delete course (this will cascade delete related records like assignments, schedule, etc.)
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

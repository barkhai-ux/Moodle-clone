import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
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

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedCourse = {
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
      classNumber: course.classNumber,
      prerequisites: [], // This would need to be implemented with a separate table
    };

    return NextResponse.json({ course: transformedCourse });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, coverImage, credits, capacity, classNumber, schedule } = await request.json();

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      include: { schedule: true },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Update course data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (credits !== undefined) updateData.credits = credits;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (classNumber !== undefined) updateData.classNumber = classNumber;

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: updateData,
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

    // Handle schedule update if provided
    if (schedule) {
      if (existingCourse.schedule) {
        // Update existing schedule
        await prisma.courseSchedule.update({
          where: { courseId: params.id },
          data: {
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: schedule.room || null,
          },
        });
      } else {
        // Create new schedule
        await prisma.courseSchedule.create({
          data: {
            courseId: params.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: schedule.room || null,
          },
        });
      }
    }

    // Fetch the updated course with schedule
    const finalCourse = await prisma.course.findUnique({
      where: { id: params.id },
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
    const transformedCourse = {
      id: finalCourse!.id,
      title: finalCourse!.title,
      description: finalCourse!.description,
      instructor: finalCourse!.instructor,
      enrolledStudents: finalCourse!.enrollments.map(enrollment => enrollment.student),
      coverImage: finalCourse!.coverImage,
      createdAt: finalCourse!.createdAt.toISOString(),
      updatedAt: finalCourse!.updatedAt.toISOString(),
      schedule: finalCourse!.schedule,
      credits: finalCourse!.credits,
      capacity: finalCourse!.capacity,
      classNumber: finalCourse!.classNumber,
      prerequisites: [], // This would need to be implemented with a separate table
    };

    return NextResponse.json({ course: transformedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: params.id },
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

    // Delete course (this will cascade delete related records)
    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

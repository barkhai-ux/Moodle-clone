import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check

    const courseId = params.id;
    console.log('PUT /api/admin/courses/[id]/schedule - courseId:', courseId);
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { dayOfWeek, startTime, endTime, room } = body;

    // Validate input
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      console.log('Invalid day of week:', dayOfWeek);
      return NextResponse.json({ error: 'Invalid day of week' }, { status: 400 });
    }

    if (!startTime || !endTime || !room) {
      console.log('Missing required fields:', { startTime, endTime, room });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Looking for course with ID:', courseId);
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      console.log('Course not found:', courseId);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Course found:', course.title);

    // Check if the room is already occupied in this time slot
    const existingSchedule = await prisma.courseSchedule.findFirst({
      where: {
        dayOfWeek,
        startTime,
        endTime,
        room,
        courseId: { not: courseId }, // Exclude current course
      },
    });

    if (existingSchedule) {
      console.log('Room occupied by:', existingSchedule.courseId);
      return NextResponse.json({ 
        error: 'This room is already occupied in this time slot by another course' 
      }, { status: 409 });
    }

    console.log('Creating/updating schedule for course:', courseId);
    // Check if schedule already exists for this course
    const existingCourseSchedule = await prisma.courseSchedule.findFirst({
      where: { courseId },
    });

    let schedule;
    if (existingCourseSchedule) {
      // Update existing schedule
      schedule = await prisma.courseSchedule.update({
        where: { id: existingCourseSchedule.id },
        data: {
          dayOfWeek,
          startTime,
          endTime,
          room,
        },
      });
    } else {
      // Create new schedule
      schedule = await prisma.courseSchedule.create({
        data: {
          courseId,
          dayOfWeek,
          startTime,
          endTime,
          room,
        },
      });
    }

    console.log('Schedule created/updated:', schedule);

    // Make the course available for enrollment when scheduled
    await prisma.course.update({
      where: { id: courseId },
      data: { isAvailableForEnrollment: true },
    });

    console.log('Course availability updated');

    return NextResponse.json({ 
      message: 'Course schedule updated successfully',
      schedule 
    });
  } catch (error) {
    console.error('Error updating course schedule:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check

    const courseId = params.id;
    console.log('DELETE /api/admin/courses/[id]/schedule - courseId:', courseId);

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      console.log('Course not found for deletion:', courseId);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    console.log('Course found for deletion:', course.title);

    // Delete schedule
    await prisma.courseSchedule.deleteMany({
      where: { courseId },
    });

    console.log('Schedule deleted for course:', courseId);

    // Make the course unavailable for enrollment when schedule is removed
    await prisma.course.update({
      where: { id: courseId },
      data: { isAvailableForEnrollment: false },
    });

    console.log('Course availability updated for deletion');

    return NextResponse.json({ 
      message: 'Course schedule removed successfully' 
    });
  } catch (error) {
    console.error('Error removing course schedule:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const instructorId = searchParams.get('instructorId');

    let whereClause = {};

    if (courseId) {
      whereClause = { courseId };
    } else if (instructorId) {
      whereClause = { instructorId };
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const transformedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      courseId: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.toISOString(),
      maxPoints: assignment.maxPoints,
      createdAt: assignment.createdAt.toISOString(),
      course: assignment.course,
      instructor: assignment.instructor,
    }));

    return NextResponse.json({ assignments: transformedAssignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, title, description, dueDate, maxPoints, instructorId } = body;

    if (!courseId || !title || !description || !dueDate || !maxPoints || !instructorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxPoints: parseInt(maxPoints),
        instructorId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const transformedAssignment = {
      id: assignment.id,
      courseId: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.toISOString(),
      maxPoints: assignment.maxPoints,
      createdAt: assignment.createdAt.toISOString(),
      course: assignment.course,
      instructor: assignment.instructor,
    };

    return NextResponse.json({ assignment: transformedAssignment });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

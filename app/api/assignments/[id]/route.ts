import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, dueDate, maxPoints } = body;

    if (!title || !description || !dueDate || !maxPoints) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.update({
      where: { id: params.id },
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        maxPoints: parseInt(maxPoints),
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
    console.error('Error updating assignment:', error);
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
    await prisma.assignment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

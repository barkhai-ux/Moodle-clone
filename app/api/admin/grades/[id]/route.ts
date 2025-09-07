import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check
    
    const { points, feedback } = await request.json();
    const gradeId = params.id;

    if (points === undefined || points < 0) {
      return NextResponse.json(
        { error: 'Invalid points value' },
        { status: 400 }
      );
    }

    // Get the grade to check max points
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    if (points > existingGrade.maxPoints) {
      return NextResponse.json(
        { error: 'Points cannot exceed max points' },
        { status: 400 }
      );
    }

    // Update the grade
    const updatedGrade = await prisma.grade.update({
      where: { id: gradeId },
      data: {
        points,
        feedback,
        gradedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ grade: updatedGrade });
  } catch (error) {
    console.error('Error updating grade:', error);
    return NextResponse.json(
      { error: 'Failed to update grade' },
      { status: 500 }
    );
  }
}

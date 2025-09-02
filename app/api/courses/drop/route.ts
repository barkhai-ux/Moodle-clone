import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Student ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    return NextResponse.json({ 
      message: 'Successfully dropped course' 
    });
  } catch (error) {
    console.error('Drop course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

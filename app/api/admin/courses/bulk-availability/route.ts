import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const { courseIds, isAvailableForEnrollment } = await request.json();

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'Course IDs array is required' },
        { status: 400 }
      );
    }

    const updatedCourses = await prisma.course.updateMany({
      where: {
        id: {
          in: courseIds,
        },
      },
      data: {
        isAvailableForEnrollment,
      },
    });

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedCourses.count 
    });
  } catch (error) {
    console.error('Error bulk updating course availability:', error);
    return NextResponse.json(
      { error: 'Failed to update course availability' },
      { status: 500 }
    );
  }
}

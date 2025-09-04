import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAvailableForEnrollment } = await request.json();
    const courseId = params.id;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { isAvailableForEnrollment },
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
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error('Error updating course availability:', error);
    return NextResponse.json(
      { error: 'Failed to update course availability' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const assignmentId = searchParams.get('assignmentId');

    let whereClause = {};

    if (studentId) {
      whereClause = { studentId };
    }
    if (courseId) {
      whereClause = { ...whereClause, assignment: { courseId } };
    }
    if (assignmentId) {
      whereClause = { ...whereClause, assignmentId };
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        assignment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const transformedGrades = grades.map(grade => ({
      id: grade.id,
      studentId: grade.studentId,
      courseId: grade.assignment.course.id,
      assignmentId: grade.assignmentId,
      points: grade.points,
      maxPoints: grade.maxPoints,
      feedback: grade.feedback,
      gradedAt: grade.gradedAt.toISOString(),
      assignment: grade.assignment,
      student: grade.student,
    }));

    return NextResponse.json({ grades: transformedGrades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

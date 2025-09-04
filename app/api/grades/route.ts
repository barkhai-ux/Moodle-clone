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
      whereClause = { ...whereClause, studentId };
    }
    if (courseId) {
      whereClause = { ...whereClause, courseId };
    }
    if (assignmentId) {
      whereClause = { ...whereClause, assignmentId };
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
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
            maxPoints: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const transformedGrades = grades.map(grade => ({
      id: grade.id,
      studentId: grade.studentId,
      courseId: grade.courseId,
      assignmentId: grade.assignmentId,
      points: grade.points,
      maxPoints: grade.maxPoints,
      feedback: grade.feedback,
      createdAt: grade.createdAt.toISOString(),
      student: grade.student,
      assignment: grade.assignment,
      course: grade.course,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, courseId, assignmentId, points, maxPoints, feedback } = body;

    if (!studentId || !courseId || !assignmentId || points === undefined || !maxPoints) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const grade = await prisma.grade.create({
      data: {
        studentId,
        courseId,
        assignmentId,
        points: parseInt(points),
        maxPoints: parseInt(maxPoints),
        feedback,
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
            maxPoints: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const transformedGrade = {
      id: grade.id,
      studentId: grade.studentId,
      courseId: grade.courseId,
      assignmentId: grade.assignmentId,
      points: grade.points,
      maxPoints: grade.maxPoints,
      feedback: grade.feedback,
      createdAt: grade.createdAt.toISOString(),
      student: grade.student,
      assignment: grade.assignment,
      course: grade.course,
    };

    return NextResponse.json({ grade: transformedGrade });
  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

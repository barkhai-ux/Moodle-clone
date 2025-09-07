import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    // Fetch all grades with related data
    const grades = await prisma.grade.findMany({
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
        assignment: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: [
        { student: { name: 'asc' } },
        { assignment: { course: { title: 'asc' } } },
        { assignment: { title: 'asc' } },
      ],
    });

    // Convert to CSV format
    const csvHeaders = [
      'Student Name',
      'Student Email',
      'Course',
      'Assignment',
      'Points',
      'Max Points',
      'Percentage',
      'Feedback',
      'Graded At',
    ];

    const csvRows = grades.map((grade) => [
      grade.student.name,
      grade.student.email,
      grade.assignment.course.title,
      grade.assignment.title,
      grade.points,
      grade.maxPoints,
      ((grade.points / grade.maxPoints) * 100).toFixed(2) + '%',
      grade.feedback || '',
      new Date(grade.gradedAt).toLocaleDateString(),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="student-grades.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting grades:', error);
    return NextResponse.json(
      { error: 'Failed to export grades' },
      { status: 500 }
    );
  }
}

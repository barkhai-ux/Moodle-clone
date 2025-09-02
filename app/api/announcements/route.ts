import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const authorId = searchParams.get('authorId');

    let whereClause = {};

    if (courseId) {
      whereClause = { courseId };
    }
    if (authorId) {
      whereClause = { ...whereClause, authorId };
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      courseId: announcement.courseId,
      title: announcement.title,
      content: announcement.content,
      authorId: announcement.authorId,
      createdAt: announcement.createdAt.toISOString(),
      course: announcement.course,
      author: announcement.author,
    }));

    return NextResponse.json({ announcements: transformedAnnouncements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let whereClause: any = {
      members: {
        some: {
          userId: userId,
          isActive: true
        }
      }
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    const chatRooms = await prisma.chatRoom.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            classNumber: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          where: {
            deletedById: null, // Only show non-deleted messages
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ chatRooms });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, courseId, memberIds } = await request.json();

    if (!name || !type || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Name, type, and member IDs are required' },
        { status: 400 }
      );
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        name,
        type,
        courseId: courseId || null,
        members: {
          create: memberIds.map((userId: string) => ({
            userId,
            isActive: true,
          })),
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            classNumber: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ chatRoom }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

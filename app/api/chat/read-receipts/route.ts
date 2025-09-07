import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Mark message as read
export async function POST(request: NextRequest) {
  try {
    const { messageId, userId } = await request.json();

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'Message ID and user ID are required' },
        { status: 400 }
      );
    }

    // Check if user has already read this message
    const existingReceipt = await prisma.readReceipt.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
    });

    if (existingReceipt) {
      return NextResponse.json({ success: true, alreadyRead: true });
    }

    // Create read receipt
    const readReceipt = await prisma.readReceipt.create({
      data: {
        messageId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ readReceipt }, { status: 201 });
  } catch (error) {
    console.error('Error creating read receipt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get read receipts for a message
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const readReceipts = await prisma.readReceipt.findMany({
      where: { messageId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ readReceipts });
  } catch (error) {
    console.error('Error fetching read receipts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

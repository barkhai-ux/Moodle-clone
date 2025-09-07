import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        roomId: chatId,
        deletedById: null, // Only show non-deleted messages
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        readReceipts: {
          select: {
            userId: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { chatId, senderId, content, messageType = 'TEXT' } = await request.json();

    if (!chatId || !senderId || !content) {
      return NextResponse.json(
        { error: 'Chat ID, sender ID, and content are required' },
        { status: 400 }
      );
    }

    // Verify the sender is a member of the chat
    const membership = await prisma.chatMember.findUnique({
      where: {
        userId_chatId: {
          userId: senderId,
          chatId: chatId,
        },
      },
    });

    if (!membership || !membership.isActive) {
      return NextResponse.json(
        { error: 'User is not a member of this chat' },
        { status: 403 }
      );
    }

    // Basic validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 2000 characters allowed.' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        roomId: chatId,
        senderId,
        body: content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        readReceipts: {
          select: {
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    // Update the chat room's updatedAt timestamp
    await prisma.chatRoom.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

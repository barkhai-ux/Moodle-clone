import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE message (soft delete for moderation)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id;
    const { deletedBy } = await request.json();

    if (!deletedBy) {
      return NextResponse.json(
        { error: 'Deleted by user ID is required' },
        { status: 400 }
      );
    }

    // Get the message with sender and room info
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: { select: { id: true, role: true } },
        room: {
          include: {
            members: {
              where: { userId: deletedBy },
              include: { user: { select: { role: true } } }
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check permissions: sender or admin/teacher
    const isSender = message.sender.id === deletedBy;
    const isModerator = message.room.members[0]?.user.role === 'ADMIN' || 
                       message.room.members[0]?.user.role === 'TEACHER';

    if (!isSender && !isModerator) {
      return NextResponse.json(
        { error: 'Not authorized to delete this message' },
        { status: 403 }
      );
    }

    // Soft delete the message
    await prisma.message.update({
      where: { id: messageId },
      data: { deletedById: deletedBy },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Socket } from 'socket.io';
import { prisma } from '@/lib/prisma';

// Rate limiting and validation utilities
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const typingUsers = new Map<string, Set<string>>(); // roomId -> Set of userIds
const onlineUsers = new Map<string, Set<string>>(); // roomId -> Set of userIds

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const RATE_LIMIT_MAX_MESSAGES = 5;
const TYPING_DEBOUNCE_TIME = 2000; // 2 seconds

// Basic profanity filter (you can enhance this with a proper library)
const PROFANITY_WORDS = ['badword1', 'badword2']; // Add your profanity words here
const profanityFilter = (text: string): string => {
  let filteredText = text;
  PROFANITY_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  return filteredText;
};

// Rate limiting check
const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_MESSAGES) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

// Validate message
const validateMessage = (content: string): { isValid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (content.length > MAX_MESSAGE_LENGTH) {
    return { isValid: false, error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` };
  }
  
  return { isValid: true };
};

// Socket.IO server setup
let io: SocketIOServer;

export const initializeSocket = (httpServer: NetServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    },
    path: '/api/socketio'
  });

  // Socket.IO event handlers
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join_room', async (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      
      console.log('Join room request:', { roomId, userId, socketId: socket.id });
      
      try {
        // Verify user is a member of the room
        const membership = await prisma.chatMember.findUnique({
          where: {
            userId_chatId: {
              userId,
              chatId: roomId
            }
          }
        });

        console.log('Membership check result:', membership);

        if (!membership || !membership.isActive) {
          console.log('User not authorized to join room:', { userId, roomId, membership });
          socket.emit('error', { message: 'Not authorized to join this room' });
          return;
        }

        // Join the socket room
        socket.join(roomId);
        
        // Add user to online users
        if (!onlineUsers.has(roomId)) {
          onlineUsers.set(roomId, new Set());
        }
        onlineUsers.get(roomId)!.add(userId);
        
        // Get user info for presence
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, avatar: true }
        });

        // Broadcast user joined
        socket.to(roomId).emit('user_joined', {
          userId,
          user,
          onlineCount: onlineUsers.get(roomId)!.size
        });

        // Send current online users to the joining user
        const onlineUserIds = Array.from(onlineUsers.get(roomId) || []);
        const onlineUsersData = await prisma.user.findMany({
          where: { id: { in: onlineUserIds } },
          select: { id: true, name: true, avatar: true }
        });

        socket.emit('online_users', onlineUsersData);

      } catch (error) {
        console.error('Error joining room:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Error details:', {
          message: errorMessage,
          stack: errorStack,
          roomId,
          userId
        });
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave_room', (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      
      socket.leave(roomId);
      
      // Remove user from online users
      const roomUsers = onlineUsers.get(roomId);
      if (roomUsers) {
        roomUsers.delete(userId);
        if (roomUsers.size === 0) {
          onlineUsers.delete(roomId);
        }
      }
      
      // Remove from typing users
      const typingRoomUsers = typingUsers.get(roomId);
      if (typingRoomUsers) {
        typingRoomUsers.delete(userId);
        if (typingRoomUsers.size === 0) {
          typingUsers.delete(roomId);
        }
      }
      
      // Broadcast user left
      socket.to(roomId).emit('user_left', {
        userId,
        onlineCount: onlineUsers.get(roomId)?.size || 0
      });
    });

    // Send message
    socket.on('send_message', async (data: { roomId: string; userId: string; content: string }) => {
      const { roomId, userId, content } = data;
      
      try {
        // Rate limiting check
        if (!checkRateLimit(userId)) {
          socket.emit('error', { message: 'Rate limit exceeded. Please wait before sending another message.' });
          return;
        }

        // Validate message
        const validation = validateMessage(content);
        if (!validation.isValid) {
          socket.emit('error', { message: validation.error });
          return;
        }

        // Verify user is a member of the room
        const membership = await prisma.chatMember.findUnique({
          where: {
            userId_chatId: {
              userId,
              chatId: roomId
            }
          }
        });

        if (!membership || !membership.isActive) {
          socket.emit('error', { message: 'Not authorized to send messages to this room' });
          return;
        }

        // Apply profanity filter
        const filteredContent = profanityFilter(content);

        // Create message in database
        const message = await prisma.message.create({
          data: {
            roomId,
            senderId: userId,
            body: filteredContent,
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

        // Update chat room timestamp
        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { updatedAt: new Date() },
        });

        // Broadcast message to room
        io.to(roomId).emit('new_message', message);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing_start', (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      
      if (!typingUsers.has(roomId)) {
        typingUsers.set(roomId, new Set());
      }
      
      const wasTyping = typingUsers.get(roomId)!.has(userId);
      typingUsers.get(roomId)!.add(userId);
      
      if (!wasTyping) {
        socket.to(roomId).emit('user_typing', { userId, roomId });
      }
      
      // Auto-remove typing indicator after debounce time
      setTimeout(() => {
        const roomTypingUsers = typingUsers.get(roomId);
        if (roomTypingUsers && roomTypingUsers.has(userId)) {
          roomTypingUsers.delete(userId);
          socket.to(roomId).emit('user_stopped_typing', { userId, roomId });
        }
      }, TYPING_DEBOUNCE_TIME);
    });

    socket.on('typing_stop', (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      
      const roomTypingUsers = typingUsers.get(roomId);
      if (roomTypingUsers && roomTypingUsers.has(userId)) {
        roomTypingUsers.delete(userId);
        socket.to(roomId).emit('user_stopped_typing', { userId, roomId });
      }
    });

    // Read receipt
    socket.on('mark_read', async (data: { messageId: string; userId: string }) => {
      const { messageId, userId } = data;
      
      try {
        // Check if user has already read this message
        const existingReceipt = await prisma.readReceipt.findUnique({
          where: {
            messageId_userId: {
              messageId,
              userId,
            },
          },
        });

        if (!existingReceipt) {
          // Create read receipt
          await prisma.readReceipt.create({
            data: {
              messageId,
              userId,
            },
          });

          // Get message info for broadcast
          const message = await prisma.message.findUnique({
            where: { id: messageId },
            select: { roomId: true },
          });

          if (message) {
            // Broadcast read receipt to room
            socket.to(message.roomId).emit('message_read', {
              messageId,
              userId,
              readAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Delete message (moderation)
    socket.on('delete_message', async (data: { messageId: string; userId: string; deletedBy: string }) => {
      const { messageId, userId, deletedBy } = data;
      
      try {
        // Verify the user has permission to delete (sender or admin/teacher)
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
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        const isSender = message.sender.id === deletedBy;
        const isModerator = message.room.members[0]?.user.role === 'ADMIN' || 
                           message.room.members[0]?.user.role === 'TEACHER';

        if (!isSender && !isModerator) {
          socket.emit('error', { message: 'Not authorized to delete this message' });
          return;
        }

        // Mark message as deleted (soft delete)
        await prisma.message.update({
          where: { id: messageId },
          data: { deletedById: deletedBy },
        });

        // Broadcast message deletion
        io.to(message.roomId).emit('message_deleted', {
          messageId,
          deletedBy,
          deletedAt: new Date(),
        });

      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Clean up user from all rooms
      for (const [roomId, users] of Array.from(onlineUsers.entries())) {
        for (const userId of Array.from(users)) {
          // This is a simplified cleanup - in production you'd want to track socket->user mapping
          socket.to(roomId).emit('user_left', {
            userId,
            onlineCount: users.size - 1
          });
        }
      }
    });
  });

  return io;
};

export { io };

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface SocketMessage {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
  deletedById?: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

interface TypingUser {
  userId: string;
  roomId: string;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
}

interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  markMessageAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string, roomId: string) => void;
  onlineUsers: OnlineUser[];
  typingUsers: string[];
  onNewMessage: (callback: (message: SocketMessage) => void) => void;
  onUserJoined: (callback: (data: { userId: string; user: OnlineUser; onlineCount: number }) => void) => void;
  onUserLeft: (callback: (data: { userId: string; onlineCount: number }) => void) => void;
  onUserTyping: (callback: (data: TypingUser) => void) => void;
  onUserStoppedTyping: (callback: (data: TypingUser) => void) => void;
  onMessageRead: (callback: (data: ReadReceipt) => void) => void;
  onMessageDeleted: (callback: (data: { messageId: string; deletedBy: string; deletedAt: string }) => void) => void;
  onError: (callback: (error: { message: string }) => void) => void;
}

export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  // Event callbacks
  const callbacksRef = useRef({
    onNewMessage: [] as ((message: SocketMessage) => void)[],
    onUserJoined: [] as ((data: { userId: string; user: OnlineUser; onlineCount: number }) => void)[],
    onUserLeft: [] as ((data: { userId: string; onlineCount: number }) => void)[],
    onUserTyping: [] as ((data: TypingUser) => void)[],
    onUserStoppedTyping: [] as ((data: TypingUser) => void)[],
    onMessageRead: [] as ((data: ReadReceipt) => void)[],
    onMessageDeleted: [] as ((data: { messageId: string; deletedBy: string; deletedAt: string }) => void)[],
    onError: [] as ((error: { message: string }) => void)[],
  });

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socketio',
      auth: {
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      setIsConnected(false);
      setOnlineUsers([]);
      setTypingUsers([]);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Message events
    socket.on('new_message', (message: SocketMessage) => {
      callbacksRef.current.onNewMessage.forEach(callback => callback(message));
    });

    // Presence events
    socket.on('user_joined', (data: { userId: string; user: OnlineUser; onlineCount: number }) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.id === data.userId);
        if (!exists) {
          return [...prev, data.user];
        }
        return prev;
      });
      callbacksRef.current.onUserJoined.forEach(callback => callback(data));
    });

    socket.on('user_left', (data: { userId: string; onlineCount: number }) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== data.userId));
      callbacksRef.current.onUserLeft.forEach(callback => callback(data));
    });

    socket.on('online_users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    // Typing events
    socket.on('user_typing', (data: TypingUser) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
      callbacksRef.current.onUserTyping.forEach(callback => callback(data));
    });

    socket.on('user_stopped_typing', (data: TypingUser) => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
      callbacksRef.current.onUserStoppedTyping.forEach(callback => callback(data));
    });

    // Read receipt events
    socket.on('message_read', (data: ReadReceipt) => {
      callbacksRef.current.onMessageRead.forEach(callback => callback(data));
    });

    // Moderation events
    socket.on('message_deleted', (data: { messageId: string; deletedBy: string; deletedAt: string }) => {
      callbacksRef.current.onMessageDeleted.forEach(callback => callback(data));
    });

    // Error events
    socket.on('error', (error: { message: string }) => {
      callbacksRef.current.onError.forEach(callback => callback(error));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setOnlineUsers([]);
      setTypingUsers([]);
    };
  }, [user]);

  // Socket methods
  const joinRoom = useCallback((roomId: string) => {
    console.log('Attempting to join room:', { roomId, userId: user?.id, isConnected, hasSocket: !!socketRef.current });
    
    if (socketRef.current && user) {
      if (currentRoom) {
        console.log('Leaving current room:', currentRoom);
        socketRef.current.emit('leave_room', { roomId: currentRoom, userId: user.id });
      }
      console.log('Emitting join_room event:', { roomId, userId: user.id });
      socketRef.current.emit('join_room', { roomId, userId: user.id });
      setCurrentRoom(roomId);
    } else {
      console.log('Cannot join room - missing requirements:', { 
        hasSocket: !!socketRef.current, 
        hasUser: !!user,
        isConnected 
      });
    }
  }, [user, currentRoom]);

  const leaveRoom = useCallback((roomId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('leave_room', { roomId, userId: user.id });
      if (currentRoom === roomId) {
        setCurrentRoom(null);
      }
    }
  }, [user, currentRoom]);

  const sendMessage = useCallback((roomId: string, content: string) => {
    if (socketRef.current && user) {
      console.log('Socket: Sending message', { roomId, userId: user.id, content });
      socketRef.current.emit('send_message', { roomId, userId: user.id, content });
    } else {
      console.log('Socket: Cannot send message - socket or user not available', { 
        hasSocket: !!socketRef.current, 
        hasUser: !!user 
      });
    }
  }, [user]);

  const startTyping = useCallback((roomId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing_start', { roomId, userId: user.id });
    }
  }, [user]);

  const stopTyping = useCallback((roomId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing_stop', { roomId, userId: user.id });
    }
  }, [user]);

  const markMessageAsRead = useCallback((messageId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('mark_read', { messageId, userId: user.id });
    }
  }, [user]);

  const deleteMessage = useCallback((messageId: string, roomId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('delete_message', { messageId, userId: user.id, deletedBy: user.id });
    }
  }, [user]);

  // Event subscription methods
  const onNewMessage = useCallback((callback: (message: SocketMessage) => void) => {
    callbacksRef.current.onNewMessage.push(callback);
    return () => {
      const index = callbacksRef.current.onNewMessage.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onNewMessage.splice(index, 1);
      }
    };
  }, []);

  const onUserJoined = useCallback((callback: (data: { userId: string; user: OnlineUser; onlineCount: number }) => void) => {
    callbacksRef.current.onUserJoined.push(callback);
    return () => {
      const index = callbacksRef.current.onUserJoined.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onUserJoined.splice(index, 1);
      }
    };
  }, []);

  const onUserLeft = useCallback((callback: (data: { userId: string; onlineCount: number }) => void) => {
    callbacksRef.current.onUserLeft.push(callback);
    return () => {
      const index = callbacksRef.current.onUserLeft.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onUserLeft.splice(index, 1);
      }
    };
  }, []);

  const onUserTyping = useCallback((callback: (data: TypingUser) => void) => {
    callbacksRef.current.onUserTyping.push(callback);
    return () => {
      const index = callbacksRef.current.onUserTyping.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onUserTyping.splice(index, 1);
      }
    };
  }, []);

  const onUserStoppedTyping = useCallback((callback: (data: TypingUser) => void) => {
    callbacksRef.current.onUserStoppedTyping.push(callback);
    return () => {
      const index = callbacksRef.current.onUserStoppedTyping.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onUserStoppedTyping.splice(index, 1);
      }
    };
  }, []);

  const onMessageRead = useCallback((callback: (data: ReadReceipt) => void) => {
    callbacksRef.current.onMessageRead.push(callback);
    return () => {
      const index = callbacksRef.current.onMessageRead.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onMessageRead.splice(index, 1);
      }
    };
  }, []);

  const onMessageDeleted = useCallback((callback: (data: { messageId: string; deletedBy: string; deletedAt: string }) => void) => {
    callbacksRef.current.onMessageDeleted.push(callback);
    return () => {
      const index = callbacksRef.current.onMessageDeleted.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onMessageDeleted.splice(index, 1);
      }
    };
  }, []);

  const onError = useCallback((callback: (error: { message: string }) => void) => {
    callbacksRef.current.onError.push(callback);
    return () => {
      const index = callbacksRef.current.onError.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.onError.splice(index, 1);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    deleteMessage,
    onlineUsers,
    typingUsers,
    onNewMessage,
    onUserJoined,
    onUserLeft,
    onUserTyping,
    onUserStoppedTyping,
    onMessageRead,
    onMessageDeleted,
    onError,
  };
}

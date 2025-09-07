'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Plus, Users, BookOpen, Bell, BellOff, Settings, MoreVertical, Trash2, Check, CheckCheck } from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSocket } from '@/hooks/use-socket';
import { ChatRoom, Message, Course, User, ChatMessage } from '@/types';
import { toast } from '@/hooks/use-toast';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { 
    unreadCounts, 
    totalUnreadCount, 
    markAsRead, 
    markAllAsRead, 
    addNotification,
    isNotificationEnabled,
    toggleNotifications 
  } = useNotifications();
  const {
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead: socketMarkAsRead,
    deleteMessage: socketDeleteMessage,
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
  } = useSocket();
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const loadingMessagesRef = useRef(false);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [newChatData, setNewChatData] = useState({
    name: '',
    type: 'DIRECT' as 'DIRECT' | 'GROUP' | 'COURSE',
    courseId: '',
    memberIds: [] as string[],
  });
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChatRooms = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Loading chat rooms for user:', user.id);
      const rooms = await DataService.getChatRooms({ userId: user.id });
      console.log('Loaded chat rooms:', rooms);
      setChatRooms(rooms);
      if (rooms.length > 0 && !selectedChat) {
        setSelectedChat(rooms[0]);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, selectedChat]);

  const loadAvailableData = useCallback(async () => {
    if (!user) return;
    
    try {
      const [users, courses] = await Promise.all([
        DataService.getUsers(),
        DataService.getCourses({ studentId: user.id })
      ]);
      setAvailableUsers(users.filter(u => u.id !== user.id));
      setAvailableCourses(courses);
    } catch (error) {
      console.error('Error loading available data:', error);
    }
  }, [user]);

  const loadMessages = useCallback(async (chatId: string) => {
    if (loadingMessagesRef.current) {
      console.log('Messages already loading, skipping request');
      return;
    }
    
    try {
      loadingMessagesRef.current = true;
      setLoadingMessages(true);
      console.log('Loading messages for chat:', chatId);
      const chatMessages = await DataService.getMessages({ chatId });
      console.log('Loaded messages:', chatMessages);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      loadingMessagesRef.current = false;
      setLoadingMessages(false);
    }
  }, [toast]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const messageContent = newMessage.trim();
    console.log('Sending message:', { roomId: selectedChat.id, content: messageContent, userId: user.id });
    setNewMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      stopTyping(selectedChat.id);
      setIsTyping(false);
    }

    // Send via socket (real-time)
    socketSendMessage(selectedChat.id, messageContent);
  }, [newMessage, selectedChat, user, socketSendMessage, isTyping, stopTyping]);

  const createNewChat = useCallback(async () => {
    if (!user || !newChatData.name || newChatData.memberIds.length === 0) return;

    try {
      const chatRoom = await DataService.createChatRoom({
        ...newChatData,
        memberIds: [...newChatData.memberIds, user.id],
      });

      if (chatRoom) {
        setChatRooms(prev => [chatRoom, ...prev]);
        setSelectedChat(chatRoom);
        setShowNewChatDialog(false);
        setNewChatData({
          name: '',
          type: 'DIRECT',
          courseId: '',
          memberIds: [],
        });
        toast({
          title: 'Success',
          description: 'Chat room created successfully',
        });
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat room',
        variant: 'destructive',
      });
    }
  }, [user, newChatData]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const getChatDisplayName = useCallback((chat: ChatRoom) => {
    if (chat.type === 'COURSE' && chat.course) {
      return `${chat.course.title} (${chat.course.classNumber})`;
    }
    return chat.name;
  }, []);

  const getChatMembers = useCallback((chat: ChatRoom) => {
    return chat.members?.map(member => member.user.name).join(', ') || '';
  }, []);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Socket event handlers
  useEffect(() => {
    const unsubscribeNewMessage = onNewMessage((socketMessage) => {
      console.log('New message received:', socketMessage);
      if (selectedChat && socketMessage.roomId === selectedChat.id) {
        // Convert SocketMessage to Message format
        const message: Message = {
          id: socketMessage.id,
          roomId: socketMessage.roomId,
          senderId: socketMessage.senderId,
          body: socketMessage.body,
          createdAt: socketMessage.createdAt,
          deletedById: socketMessage.deletedById,
          sender: {
            ...socketMessage.sender,
            createdAt: socketMessage.createdAt, // Use message creation time as fallback
            role: socketMessage.sender.role as 'STUDENT' | 'TEACHER' | 'ADMIN'
          },
          readReceipts: [], // Initialize empty array
          room: selectedChat
        };
        setMessages(prev => [...prev, message]);
        // Mark as read if it's not from current user
        if (socketMessage.senderId !== user?.id) {
          socketMarkAsRead(socketMessage.id);
        }
      }
      // Add notification for other rooms
      if (!selectedChat || socketMessage.roomId !== selectedChat.id) {
        // Convert SocketMessage to ChatMessage format for notification
        const chatMessage: ChatMessage = {
          id: socketMessage.id,
          roomId: socketMessage.roomId,
          senderId: socketMessage.senderId,
          body: socketMessage.body,
          createdAt: socketMessage.createdAt,
          deletedById: socketMessage.deletedById,
          sender: {
            ...socketMessage.sender,
            createdAt: socketMessage.createdAt,
            role: socketMessage.sender.role as 'STUDENT' | 'TEACHER' | 'ADMIN'
          },
          readReceipts: [],
          room: { id: socketMessage.roomId, name: '', type: 'DIRECT', createdAt: socketMessage.createdAt, updatedAt: socketMessage.createdAt, members: [], messages: [] },
          chat: { id: socketMessage.roomId, name: '', type: 'DIRECT', createdAt: socketMessage.createdAt, updatedAt: socketMessage.createdAt, members: [], messages: [] },
          chatId: socketMessage.roomId,
          content: socketMessage.body,
          messageType: 'TEXT',
          updatedAt: socketMessage.createdAt
        };
        addNotification(socketMessage.roomId, chatMessage);
      }
    });

    const unsubscribeUserJoined = onUserJoined((data) => {
      if (selectedChat && data.userId !== user?.id) {
        toast({
          title: 'User joined',
          description: `${data.user.name} joined the chat`,
        });
      }
    });

    const unsubscribeUserLeft = onUserLeft((data) => {
      if (selectedChat && data.userId !== user?.id) {
        toast({
          title: 'User left',
          description: 'A user left the chat',
        });
      }
    });

    const unsubscribeUserTyping = onUserTyping((data) => {
      if (selectedChat && data.roomId === selectedChat.id && data.userId !== user?.id) {
        // Handle typing indicator display
      }
    });

    const unsubscribeUserStoppedTyping = onUserStoppedTyping((data) => {
      if (selectedChat && data.roomId === selectedChat.id && data.userId !== user?.id) {
        // Handle typing indicator removal
      }
    });

    const unsubscribeMessageRead = onMessageRead((data) => {
      // Handle read receipt updates
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, readReceipts: [...(msg.readReceipts || []), { id: '', messageId: data.messageId, userId: data.userId, createdAt: data.readAt }] }
          : msg
      ));
    });

    const unsubscribeMessageDeleted = onMessageDeleted((data) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      toast({
        title: 'Message deleted',
        description: 'A message was deleted',
      });
    });

    const unsubscribeError = onError((error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    });

    return () => {
      // Cleanup will be handled by the socket hook when the component unmounts
      // or when the dependencies change
    };
  }, [selectedChat?.id, user?.id]); // Only depend on the IDs, not the functions

  useEffect(() => {
    if (user) {
      loadChatRooms();
      loadAvailableData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      // Join the room via socket
      joinRoom(selectedChat.id);
      // Mark chat as read when selected
      markAsRead(selectedChat.id);
    }

    return () => {
      if (selectedChat) {
        leaveRoom(selectedChat.id);
      }
    };
  }, [selectedChat?.id]); // Only depend on the chat ID, not the functions

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTyping = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!selectedChat || !user) return;

    if (!isTyping) {
      startTyping(selectedChat.id);
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      stopTyping(selectedChat.id);
      setIsTyping(false);
    }, 2000);

    setTypingTimeout(timeout);
  }, [selectedChat, user, isTyping, startTyping, stopTyping, typingTimeout]);

  // Handle message deletion
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!selectedChat || !user) return;

    try {
      await socketDeleteMessage(messageId, selectedChat.id);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  }, [selectedChat, user, socketDeleteMessage]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600 dark:text-gray-400">Loading chat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <div className={`flex h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Chat Rooms Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h2>
              {totalUnreadCount > 0 && (
                <NotificationBadge count={totalUnreadCount} size="sm" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNotificationSettings(true)}
                title="Notification settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Chat Name</label>
                      <Input
                        value={newChatData.name}
                        onChange={(e) => setNewChatData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter chat name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Chat Type</label>
                      <Select
                        value={newChatData.type}
                        onValueChange={(value: 'DIRECT' | 'GROUP' | 'COURSE') => 
                          setNewChatData(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DIRECT">Direct Message</SelectItem>
                          <SelectItem value="GROUP">Group Chat</SelectItem>
                          <SelectItem value="COURSE">Course Chat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newChatData.type === 'COURSE' && (
                      <div>
                        <label className="text-sm font-medium">Course</label>
                        <Select
                          value={newChatData.courseId}
                          onValueChange={(value) => 
                            setNewChatData(prev => ({ ...prev, courseId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCourses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Members</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {availableUsers.map((user) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={user.id}
                              checked={newChatData.memberIds.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewChatData(prev => ({
                                    ...prev,
                                    memberIds: [...prev.memberIds, user.id]
                                  }));
                                } else {
                                  setNewChatData(prev => ({
                                    ...prev,
                                    memberIds: prev.memberIds.filter(id => id !== user.id)
                                  }));
                                }
                              }}
                            />
                            <label htmlFor={user.id} className="text-sm">
                              {user.name} ({user.role})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button onClick={createNewChat} className="w-full">
                      Create Chat
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Notification Settings Dialog */}
              <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Browser Notifications</label>
                        <p className="text-sm text-gray-500">
                          Receive notifications when the browser is in the background
                        </p>
                      </div>
                      <button
                        onClick={toggleNotifications}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isNotificationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isNotificationEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Unread Messages</label>
                        <p className="text-sm text-gray-500">
                          {totalUnreadCount} unread messages
                        </p>
                      </div>
                      {totalUnreadCount > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chatRooms && chatRooms.length > 0 ? (
            chatRooms.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedChat?.id === chat.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10 relative">
                  <AvatarFallback>
                    {chat.type === 'COURSE' ? <BookOpen className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </AvatarFallback>
                  <NotificationBadge count={unreadCounts[chat.id] || 0} size="sm" />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getChatDisplayName(chat)}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {chat.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {chat.members?.length || 0} members
                  </p>
                  {chat.messages && chat.messages.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {chat.messages[0].sender.name}: {chat.messages[0].content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No chat rooms found</p>
              <p className="text-sm">Create a new chat to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {selectedChat.type === 'COURSE' ? <BookOpen className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {getChatDisplayName(selectedChat)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getChatMembers(selectedChat)}
                      </p>
                      {isConnected && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {onlineUsers.length} online
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {typingUsers.length > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages?.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.sender.id === user?.id ? 'order-2' : 'order-1'}`}>
                    {message.sender.id !== user?.id && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.sender.name}
                        </span>
                      </div>
                    )}
                    <div className="relative group">
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender.id === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.body}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender.id === user?.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                          {message.sender.id === user?.id && (
                            <div className="flex items-center space-x-1">
                              {message.readReceipts && message.readReceipts.length > 0 ? (
                                <CheckCheck className="w-3 h-3 text-blue-200" />
                              ) : (
                                <Check className="w-3 h-3 text-blue-200" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Message actions dropdown */}
                      {(message.sender.id === user?.id || user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteMessage(message.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1"
                  maxLength={2000}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim() || !isConnected}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {newMessage.length > 1800 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newMessage.length}/2000 characters
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a chat to start messaging
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a chat from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

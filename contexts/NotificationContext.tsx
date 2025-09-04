'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { DataService } from '@/lib/data-service';
import { ChatRoom, ChatMessage } from '@/types';

interface NotificationContextType {
  unreadCounts: Record<string, number>;
  totalUnreadCount: number;
  markAsRead: (chatId: string) => void;
  markAllAsRead: () => void;
  addNotification: (chatId: string, message: ChatMessage) => void;
  clearNotifications: (chatId: string) => void;
  isNotificationEnabled: boolean;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef<Record<string, string>>({});

  // Calculate total unread count
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    if (user) {
      // Load initial unread counts
      loadUnreadCounts();
      
      // Set up polling for new messages
      startPolling();
      
      // Request notification permission
      requestNotificationPermission();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setIsNotificationEnabled(permission === 'granted');
    } else {
      setIsNotificationEnabled(Notification.permission === 'granted');
    }
  };

  const loadUnreadCounts = async () => {
    if (!user) return;

    try {
      const chatRooms = await DataService.getChatRooms({ userId: user.id });
      const counts: Record<string, number> = {};

      for (const chat of chatRooms) {
        if (chat.messages && chat.messages.length > 0) {
          const lastMessage = chat.messages[0];
          const lastReadTime = localStorage.getItem(`lastRead_${chat.id}_${user.id}`);
          
          if (lastReadTime) {
            const unreadMessages = chat.messages.filter(msg => 
              new Date(msg.createdAt) > new Date(lastReadTime) && 
              msg.senderId !== user.id
            );
            counts[chat.id] = unreadMessages.length;
          } else {
            // If no last read time, count all messages not sent by current user
            const unreadMessages = chat.messages.filter(msg => msg.senderId !== user.id);
            counts[chat.id] = unreadMessages.length;
          }
        } else {
          counts[chat.id] = 0;
        }
      }

      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  const startPolling = () => {
    // Poll for new messages every 30 seconds to reduce blinking
    intervalRef.current = setInterval(async () => {
      if (!user) return;

      try {
        const chatRooms = await DataService.getChatRooms({ userId: user.id });
        let hasNewMessages = false;
        
        for (const chat of chatRooms) {
          if (chat.messages && chat.messages.length > 0) {
            const latestMessage = chat.messages[0];
            const lastKnownMessageId = lastMessageRef.current[chat.id];
            
            // Check if this is a new message
            if (latestMessage.id !== lastKnownMessageId && latestMessage.senderId !== user.id) {
              // Update last known message
              lastMessageRef.current[chat.id] = latestMessage.id;
              hasNewMessages = true;
              
              // Increment unread count without triggering full re-render
              setUnreadCounts(prev => ({
                ...prev,
                [chat.id]: (prev[chat.id] || 0) + 1
              }));

              // Show browser notification if enabled
              if (isNotificationEnabled && document.hidden) {
                showBrowserNotification(chat, latestMessage);
              }
            }
          }
        }
        
        // Only update unread counts if there are new messages
        if (hasNewMessages) {
          await loadUnreadCounts();
        }
      } catch (error) {
        console.error('Error polling for new messages:', error);
      }
    }, 30000); // Increased polling interval to 30 seconds to reduce blinking
  };

  const showBrowserNotification = (chat: ChatRoom, message: ChatMessage) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`New message in ${chat.name}`, {
        body: `${message.sender.name}: ${message.content}`,
        icon: '/favicon.ico',
        tag: `chat_${chat.id}`,
        requireInteraction: false,
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        // You can add navigation logic here if needed
        notification.close();
      };
    }
  };

  const markAsRead = (chatId: string) => {
    if (!user) return;

    // Update last read time
    localStorage.setItem(`lastRead_${chatId}_${user.id}`, new Date().toISOString());
    
    // Reset unread count for this chat
    setUnreadCounts(prev => ({
      ...prev,
      [chatId]: 0
    }));
  };

  const markAllAsRead = () => {
    if (!user) return;

    const now = new Date().toISOString();
    const newCounts: Record<string, number> = {};

    // Mark all chats as read
    Object.keys(unreadCounts).forEach(chatId => {
      localStorage.setItem(`lastRead_${chatId}_${user.id}`, now);
      newCounts[chatId] = 0;
    });

    setUnreadCounts(newCounts);
  };

  const addNotification = (chatId: string, message: ChatMessage) => {
    if (!user || message.senderId === user.id) return;

    setUnreadCounts(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || 0) + 1
    }));

    // Show browser notification if enabled and window is not focused
    if (isNotificationEnabled && document.hidden) {
      // We need to get the chat details to show proper notification
      // This could be enhanced by storing chat details in the context
    }
  };

  const clearNotifications = (chatId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [chatId]: 0
    }));
  };

  const toggleNotifications = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setIsNotificationEnabled(!isNotificationEnabled);
      } else {
        requestNotificationPermission();
      }
    }
  };

  const value: NotificationContextType = {
    unreadCounts,
    totalUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotifications,
    isNotificationEnabled,
    toggleNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

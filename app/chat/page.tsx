'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation currentPage="chat" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please log in</h1>
            <p className="text-gray-600 dark:text-gray-300">You need to be logged in to access the chat.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentPage="chat" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with your lecturers and fellow students
            </p>
          </div>

          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

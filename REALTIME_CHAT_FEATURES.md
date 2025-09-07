# Real-Time Chat System Implementation

## Overview

This document describes the comprehensive real-time chat system implemented for the Moodle-clone application. The system provides real-time messaging, presence tracking, typing indicators, read receipts, and moderation features.

## Features Implemented

### 1. Real-Time Communication
- **WebSocket Server**: Built with Socket.IO for reliable real-time communication
- **Multiple Chat Rooms**: Support for course-specific and direct message rooms
- **Server-Side Timestamps**: All messages are timestamped server-side for consistency

### 2. Presence System
- **Online Status**: Track which users are currently online in each room
- **Join/Leave Events**: Real-time notifications when users join or leave rooms
- **Online User Count**: Display current online users in the chat header

### 3. Typing Indicators
- **Real-Time Typing**: Broadcast when users start/stop typing
- **Debounced Events**: Typing indicators are debounced to max 1 per 2 seconds
- **Visual Feedback**: Show typing status in the chat interface

### 4. Read Receipts
- **Message Read Tracking**: Track when users have read specific messages
- **Visual Indicators**: Show read status with checkmarks (✓ for sent, ✓✓ for read)
- **Real-Time Updates**: Read receipts are broadcast in real-time

### 5. Rate Limiting & Validation
- **Message Length**: Maximum 2000 characters per message
- **Rate Limiting**: 5 messages per 10 seconds per user
- **Profanity Filter**: Basic profanity filtering (configurable word list)
- **Input Validation**: Client and server-side validation

### 6. Moderation Features
- **Message Deletion**: Soft delete messages (preserves audit trail)
- **Permission System**: Users can delete their own messages, admins/teachers can delete any
- **Audit Trail**: Deleted messages are marked with `deletedById` for tracking

## Technical Implementation

### Database Schema

```prisma
model ChatRoom {
  id         String   @id @default(cuid())
  name       String
  type       ChatType @default(DIRECT)
  courseId   String?
  isPrivate  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  course     Course?      @relation(fields: [courseId], references: [id], onDelete: Cascade)
  members    ChatMember[]
  messages   Message[]
}

model Message {
  id          String   @id @default(cuid())
  roomId      String
  senderId    String
  body        String
  createdAt   DateTime @default(now())
  deletedById String?
  room        ChatRoom     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  sender      User         @relation(fields: [senderId], references: [id], onDelete: Cascade)
  deletedBy   User?        @relation("MessageDeletedBy", fields: [deletedById], references: [id])
  readReceipts ReadReceipt[]
}

model ReadReceipt {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  createdAt DateTime @default(now())
  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([messageId, userId])
}
```

### WebSocket Server (`app/_ws/route.ts`)

The WebSocket server handles:
- User authentication and room membership verification
- Real-time message broadcasting
- Presence tracking (online users)
- Typing indicators with debouncing
- Read receipt management
- Message deletion (moderation)
- Rate limiting and validation

### Client Hook (`hooks/use-socket.ts`)

The `useSocket` hook provides:
- Socket connection management
- Event subscription system
- Real-time state management
- Typing indicator handling
- Read receipt tracking

### Enhanced Chat Interface

The `ChatInterface` component now includes:
- Real-time message display
- Online user indicators
- Typing indicators
- Read receipt visualization
- Message deletion with permission checks
- Character count and validation
- Connection status indicators

## API Endpoints

### Chat Rooms
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create new chat room

### Messages
- `GET /api/chat/messages` - Get messages for a room
- `POST /api/chat/messages` - Send a message
- `DELETE /api/chat/messages/[id]` - Delete a message (soft delete)

### Read Receipts
- `GET /api/chat/read-receipts` - Get read receipts for a message
- `POST /api/chat/read-receipts` - Mark message as read

## WebSocket Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_read` - Mark message as read
- `delete_message` - Delete a message

### Server → Client
- `new_message` - New message received
- `user_joined` - User joined the room
- `user_left` - User left the room
- `online_users` - Current online users
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `message_read` - Message was read by someone
- `message_deleted` - Message was deleted
- `error` - Error occurred

## Configuration

### Rate Limiting
- Message rate: 5 messages per 10 seconds
- Typing debounce: 2 seconds
- Max message length: 2000 characters

### Profanity Filter
Configure profanity words in `app/_ws/route.ts`:
```typescript
const PROFANITY_WORDS = ['badword1', 'badword2']; // Add your words here
```

## Testing

Run the test script to verify WebSocket functionality:
```bash
node test-websocket.js
```

## Usage

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the chat interface** at `/chat`

3. **Create or join chat rooms** using the interface

4. **Send messages** - they will appear in real-time for all users

5. **See typing indicators** when others are typing

6. **View read receipts** with checkmark indicators

7. **Delete messages** (if you have permission) using the dropdown menu

## Security Features

- **Authentication**: Users must be authenticated to use chat
- **Room Membership**: Users can only join rooms they're members of
- **Permission Checks**: Message deletion requires proper permissions
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Both client and server-side validation
- **Profanity Filtering**: Basic content moderation

## Performance Considerations

- **Debounced Typing**: Reduces network traffic
- **Soft Deletes**: Preserves data for audit while hiding from users
- **Efficient Queries**: Optimized database queries with proper indexing
- **Connection Management**: Proper cleanup on disconnect

## Future Enhancements

Potential improvements for the future:
- File/image sharing
- Message reactions/emojis
- Message search functionality
- Push notifications
- Message encryption
- Advanced moderation tools
- Chat room categories
- Message threading
- Voice/video calling integration

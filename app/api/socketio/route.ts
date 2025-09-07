import { NextRequest } from 'next/server';
import { initializeSocket } from '@/lib/socket';

export async function GET(request: NextRequest) {
  // This endpoint is used to initialize the socket server
  // The actual socket server is initialized in lib/socket.ts
  return new Response('Socket.IO server endpoint', { status: 200 });
}

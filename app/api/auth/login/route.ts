import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Hardcoded credentials for deployment/testing
    const hardcodedUsers = {
      'admin@example.com': {
        id: 'hardcoded-admin',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        createdAt: new Date().toISOString(),
      },
      'teacher@example.com': {
        id: 'hardcoded-teacher',
        email: 'teacher@example.com',
        name: 'Dr. Sarah Johnson',
        role: 'TEACHER',
        avatar: 'https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg',
        createdAt: new Date().toISOString(),
      },
      'student@example.com': {
        id: 'hardcoded-student',
        email: 'student@example.com',
        name: 'Alex Smith',
        role: 'STUDENT',
        avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg',
        createdAt: new Date().toISOString(),
      },
    };

    // Check hardcoded credentials first (for deployment)
    if (hardcodedUsers[email as keyof typeof hardcodedUsers] && password === 'password123') {
      return NextResponse.json({
        user: hardcodedUsers[email as keyof typeof hardcodedUsers],
        message: 'Login successful',
      });
    }

    // Try database authentication
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json({
        user: userWithoutPassword,
        message: 'Login successful',
      });
    } catch (dbError) {
      console.error('Database authentication error:', dbError);
      // If database fails, fall back to hardcoded credentials
      if (hardcodedUsers[email as keyof typeof hardcodedUsers] && password === 'password123') {
        return NextResponse.json({
          user: hardcodedUsers[email as keyof typeof hardcodedUsers],
          message: 'Login successful (fallback)',
        });
      }
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

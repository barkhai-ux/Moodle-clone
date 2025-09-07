import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      },
      prisma: {
        status: 'Testing connection...',
      },
    };

    // Test database connection
    try {
      await prisma.$connect();
      diagnostics.prisma.status = 'Connected successfully';
      
      // Test a simple query
      const userCount = await prisma.user.count();
      diagnostics.prisma.userCount = userCount;
      
    } catch (dbError: any) {
      diagnostics.prisma.status = 'Connection failed';
      diagnostics.prisma.error = dbError.message;
      diagnostics.prisma.errorCode = dbError.code;
    }

    return NextResponse.json(diagnostics);
  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

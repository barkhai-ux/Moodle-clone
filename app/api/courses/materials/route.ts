import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CourseMaterial } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const materials = await prisma.courseMaterial.findMany({
      where: { courseId },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Error fetching course materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!courseId || !title || !file || !uploadedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real application, you would upload the file to a cloud storage service
    // For now, we'll simulate file upload by storing file metadata
    const fileSize = file.size;
    const fileType = file.type;
    const fileName = file.name;
    const fileUrl = `/uploads/${Date.now()}-${fileName}`; // Simulated file URL

    const material = await prisma.courseMaterial.create({
      data: {
        courseId,
        title,
        description,
        fileName,
        fileSize,
        fileType,
        fileUrl,
        uploadedBy,
        uploadedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error('Error uploading course material:', error);
    return NextResponse.json({ error: 'Failed to upload material' }, { status: 500 });
  }
}


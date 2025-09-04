import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await prisma.courseMaterial.findUnique({
      where: { id: params.id },
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // In a real application, you would fetch the actual file from cloud storage
    // For now, we'll return a mock file response
    const mockFileContent = `This is a mock file for: ${material.title}`;
    const blob = new Blob([mockFileContent], { type: material.fileType });

    return new NextResponse(blob, {
      headers: {
        'Content-Type': material.fileType,
        'Content-Disposition': `attachment; filename="${material.fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading course material:', error);
    return NextResponse.json({ error: 'Failed to download material' }, { status: 500 });
  }
}


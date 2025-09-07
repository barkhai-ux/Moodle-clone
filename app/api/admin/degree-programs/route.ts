import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    const degreePrograms = await prisma.degreeProgram.findMany({
      include: {
        requirements: {
          include: {
            courses: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    credits: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ degreePrograms });
  } catch (error) {
    console.error('Error fetching degree programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch degree programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { name, description, totalCreditsRequired, requirements } = await request.json();

    if (!name || !totalCreditsRequired) {
      return NextResponse.json(
        { error: 'Missing required fields: name and totalCreditsRequired are required' },
        { status: 400 }
      );
    }

    // Create degree program
    const degreeProgram = await prisma.degreeProgram.create({
      data: {
        name,
        description: description || null,
        totalCreditsRequired,
      },
      include: {
        requirements: true,
      },
    });

    // Add requirements if provided
    if (requirements && Array.isArray(requirements)) {
      for (const requirement of requirements) {
        await prisma.degreeRequirement.create({
          data: {
            degreeProgramId: degreeProgram.id,
            category: requirement.category,
            categoryName: requirement.categoryName,
            description: requirement.description,
            requiredCredits: requirement.requiredCredits,
          },
        });
      }
    }

    return NextResponse.json({ degreeProgram }, { status: 201 });
  } catch (error) {
    console.error('Error creating degree program:', error);
    return NextResponse.json(
      { error: 'Failed to create degree program' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const { searchParams } = new URL(request.url);
    const degreeProgramId = searchParams.get('id');

    if (!degreeProgramId) {
      return NextResponse.json(
        { error: 'Degree program ID is required' },
        { status: 400 }
      );
    }

    // Check if degree program exists
    const degreeProgram = await prisma.degreeProgram.findUnique({
      where: { id: degreeProgramId },
      include: {
        requirements: true,
      },
    });

    if (!degreeProgram) {
      return NextResponse.json(
        { error: 'Degree program not found' },
        { status: 404 }
      );
    }

    // Delete degree program (this will cascade delete related records like requirements)
    await prisma.degreeProgram.delete({
      where: { id: degreeProgramId },
    });

    return NextResponse.json({ message: 'Degree program deleted successfully' });
  } catch (error) {
    console.error('Error deleting degree program:', error);
    return NextResponse.json(
      { error: 'Failed to delete degree program' },
      { status: 500 }
    );
  }
}

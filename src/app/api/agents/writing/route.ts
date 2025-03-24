import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // In a real application, you would call your AI writing assistant service here
    // This is a placeholder response
    const response = {
      message: `Writing Assistant: Based on your input: "${message}", I suggest focusing on making your content more engaging with descriptive language and a clear structure.`,
      timestamp: new Date().toISOString(),
    };

    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 600));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in writing assistant API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
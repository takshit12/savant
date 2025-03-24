import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // In a real application, you would call your AI service here
    // This is a placeholder response
    const response = {
      message: `General Assistant: I received your message: "${message}". How can I help you further?`,
      timestamp: new Date().toISOString(),
    };

    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in general assistant API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
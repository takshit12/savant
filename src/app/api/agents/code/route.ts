import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // In a real application, you would call your AI code helper service here
    // This is a placeholder response
    const response = {
      message: `Code Helper: I analyzed your code question: "${message}". Here's a suggestion: Try using a more modular approach to improve readability.`,
      timestamp: new Date().toISOString(),
    };

    // Add a small delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 700));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in code helper API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
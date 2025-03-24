import { NextResponse } from 'next/server';

// Helper to create a response with CORS headers
function corsResponse(body: any, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow all origins
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return corsResponse({ success: true });
}

export async function POST(request: Request) {
  try {
    console.log('X/Threads Assistant: Received request');
    const body = await request.json();
    const { message, toolId, platform = 'x' } = body;
    
    console.log(`X/Threads Assistant: Processing request for platform: ${platform}`);
    console.log(`X/Threads Assistant: Message content: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Call the X/Threads Assistant webhook
    console.log('X/Threads Assistant: Sending request to webhook');
    const webhookUrl = 'https://primary-production-260f.up.railway.app/webhook/0bb7d8c5-8866-4950-b7c7-45e5bbb8f683';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
    
    try {
      const response = await fetch(
        webhookUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            source: 'savant-tools-ui',
            toolId,
            platform,
            maxLength: platform === 'x' ? 280 : 500,
          }),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId); // Clear the timeout if the request completes
      
      console.log(`X/Threads Assistant: Webhook responded with status: ${response.status}`);

      // For non-200 responses, handle the error explicitly
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`X/Threads Assistant: Error response: ${errorText}`);
        return corsResponse(
          { 
            error: `Failed to process request. Webhook responded with status: ${response.status}`,
            details: errorText
          },
          response.status
        );
      }

      // Get the raw text response instead of parsing JSON
      const textResponse = await response.text();
      console.log(`X/Threads Assistant: Raw response: "${textResponse.substring(0, 100)}${textResponse.length > 100 ? '...' : ''}"`);
      
      // Return the raw text response without parsing JSON
      return corsResponse({
        message: textResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('X/Threads Assistant: Fetch error:', fetchError);
      
      // Check if it's a timeout error
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return corsResponse(
          { 
            error: 'Request timed out after 2 minutes',
            details: 'The server took too long to respond'
          },
          504
        );
      }
      
      // Handle network errors specifically for Netlify
      return corsResponse(
        { 
          error: 'Network error when contacting the webhook',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown network error',
          isNetworkError: true
        },
        502
      );
    }
  } catch (error: unknown) {
    console.error('X/Threads Assistant: Unexpected error:', error);
    
    return corsResponse(
      { 
        error: 'Failed to process request due to unexpected error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      500
    );
  }
} 
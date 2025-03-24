import axios from 'axios';

/**
 * Assistant webhook registry - add new webhooks here as needed
 */
interface WebhookRegistry {
  [key: string]: string;
}

export const WEBHOOK_URLS: WebhookRegistry = {
  xthreads: 'https://primary-production-260f.up.railway.app/webhook/0bb7d8c5-8866-4950-b7c7-45e5bbb8f683',
  // Add more webhooks as needed
  // example: "new-assistant": "https://example.com/webhook/id"
};

export const DEFAULT_TIMEOUT = 120000; // 2 minutes

/**
 * Makes a POST request to a webhook with standardized error handling
 */
export async function callAssistantWebhook(
  agentId: string, 
  message: string,
  additionalParams: Record<string, any> = {}
) {
  // Determine the correct webhook URL
  let webhookUrl = '';
  
  if (WEBHOOK_URLS[agentId]) {
    webhookUrl = WEBHOOK_URLS[agentId];
  } else {
    // Fall back to the API route if no direct webhook is defined
    webhookUrl = `/api/agents/${agentId}`;
    console.warn(`No direct webhook URL configured for agent ${agentId}, falling back to API route`);
  }
  
  console.log(`APIHelper: Calling webhook for ${agentId} at ${webhookUrl}`);
  
  // Prepare request payload
  const payload = {
    message,
    source: 'savant-tools-ui',
    toolId: agentId,
    ...additionalParams
  };
  
  // Make request with timeout
  try {
    const response = await axios.post(webhookUrl, payload, {
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`APIHelper: ${agentId} webhook responded with status:`, response.status);
    
    // Extract response text, handling different response formats
    const responseText = typeof response.data === 'string'
      ? response.data
      : response.data.message || JSON.stringify(response.data);
      
    return {
      success: true,
      data: responseText,
      status: response.status
    };
  } catch (error) {
    console.error(`APIHelper: Error calling ${agentId} webhook:`, error);
    
    let errorMessage = "Sorry, there was an error processing your request.";
    let errorDetails = "";
    let statusCode = 500;
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out after 2 minutes";
        errorDetails = "The server took too long to respond";
        statusCode = 504;
      } else if (error.response) {
        statusCode = error.response.status;
        errorMessage = `HTTP Error ${error.response.status}: ${error.response.statusText}`;
        
        if (error.response.data) {
          if (error.response.data.error) {
            errorDetails = error.response.data.error;
            if (error.response.data.details) {
              errorDetails += ` - ${error.response.data.details}`;
            }
          }
        }
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
      details: errorDetails,
      status: statusCode
    };
  }
} 
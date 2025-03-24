import axios from 'axios';
import { getWebhookConfig, DEFAULT_WEBHOOK_TIMEOUT } from './webhookRegistry';

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
  // Get webhook configuration
  const webhookConfig = getWebhookConfig(agentId);
  
  if (!webhookConfig) {
    console.warn(`No webhook configuration found for agent ${agentId}, falling back to API route`);
    // Fall back to the API route if no direct webhook is defined
    return {
      success: false,
      error: `No webhook configuration found for agent ${agentId}`,
      status: 404
    };
  }
  
  console.log(`APIHelper: Calling webhook for ${agentId} at ${webhookConfig.url}`);
  
  // Prepare request payload
  const payload = {
    message,
    source: 'savant-tools-ui',
    toolId: agentId,
    ...additionalParams
  };
  
  // Make request with timeout
  try {
    const response = await axios.post(webhookConfig.url, payload, {
      timeout: webhookConfig.timeout || DEFAULT_WEBHOOK_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...webhookConfig.additionalHeaders
      }
    });
    
    console.log(`APIHelper: ${agentId} webhook responded with status:`, response.status);
    
    // Return the raw response data without trying to pre-format it
    // Let the component-specific formatters handle the formatting
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error(`APIHelper: Error calling ${agentId} webhook:`, error);
    
    let errorMessage = "Sorry, there was an error processing your request.";
    let errorDetails = "";
    let statusCode = 500;
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out";
        errorDetails = `The server took too long to respond (timeout: ${webhookConfig.timeout || DEFAULT_WEBHOOK_TIMEOUT}ms)`;
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
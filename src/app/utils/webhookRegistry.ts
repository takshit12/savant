/**
 * Central registry for all assistant webhook URLs
 * Add new webhooks here when creating new assistants
 */

export interface WebhookConfig {
  url: string;
  timeout?: number; // Optional timeout in milliseconds
  additionalHeaders?: Record<string, string>; // Optional additional headers
}

export const WEBHOOK_REGISTRY: Record<string, WebhookConfig> = {
  // X/Threads Assistant
  xthreads: {
    url: 'https://primary-production-260f.up.railway.app/webhook/0bb7d8c5-8866-4950-b7c7-45e5bbb8f683',
    timeout: 120000, // 2 minutes
  },
  
  // Podcast Flow Strategist
  podcastflow: {
    url: 'https://primary-production-260f.up.railway.app/webhook/9cad2167-915d-4b25-979c-e550f5aeae9e',
    timeout: 120000, // 2 minutes
  },
  
  // Add more assistants here following the same pattern
};

// Default timeout for webhooks (2 minutes)
export const DEFAULT_WEBHOOK_TIMEOUT = 120000;

/**
 * Get webhook configuration for an assistant
 * @param assistantId The ID of the assistant
 * @returns WebhookConfig object or undefined if not found
 */
export function getWebhookConfig(assistantId: string): WebhookConfig | undefined {
  return WEBHOOK_REGISTRY[assistantId];
}

/**
 * Validate if an assistant ID has a registered webhook
 * @param assistantId The ID of the assistant
 * @returns boolean indicating if the webhook exists
 */
export function hasWebhook(assistantId: string): boolean {
  return assistantId in WEBHOOK_REGISTRY;
} 
# Adding a New Assistant to Savant Tools UI

This guide explains how to add a new AI assistant to the Savant Tools UI with minimal code changes.

## Architecture Overview

The Savant Tools UI uses a modular, extensible architecture designed to make adding new assistants as simple as possible:

### 1. Reusable Utilities

- **`responseFormatter.ts`**: A centralized utility for formatting responses from different assistants. Handles various response formats including JSON, boxed content, and raw text.
- **`apiHelpers.ts`**: A utility with webhook registry and standardized API communication. Provides consistent error handling and timeout management.
- **`BaseAssistantInterface.tsx`**: A base component that any assistant interface can extend. Provides common UI elements and functionality.

### 2. Factory Pattern

- **`AssistantFactory.tsx`**: A component that dynamically renders the appropriate interface based on the assistant ID.
- **`ToolManagement.tsx`**: Uses the factory pattern instead of hardcoding interface components, making it easy to add new assistants.

### 3. Templates and Documentation

- **`NewAssistantTemplate.tsx`**: A starting point for creating new assistant interfaces with all the boilerplate code ready to use.
- **`README-NEW-ASSISTANT.md`**: This documentation, providing comprehensive guidance on adding new assistants.

## Quick Start

To add a new assistant, follow these steps:

1. **Register the webhook URL** in `src/app/utils/apiHelpers.ts`
2. **Create an interface component** (optional, can use base component)
3. **Add the assistant to the factory** in `src/app/components/AssistantFactory.tsx`
4. **Register the assistant** in `src/app/utils/agentRegistry.ts`

## Detailed Steps

### 1. Register the Webhook URL

Open `src/app/utils/apiHelpers.ts` and add your webhook URL to the `WEBHOOK_URLS` object:

```typescript
export const WEBHOOK_URLS: WebhookRegistry = {
  xthreads: 'https://primary-production-260f.up.railway.app/webhook/0bb7d8c5-8866-4950-b7c7-45e5bbb8f683',
  // Add your new assistant here with its ID and webhook URL
  myNewAssistant: 'https://your-webhook-url.com/webhook/your-id',
};
```

### 2. Create the Interface Component (Optional)

If your assistant needs special UI elements or parameters, create a custom interface component. Otherwise, the generic `BaseAssistantInterface` will be used.

To create a custom interface:

1. Copy `src/app/templates/NewAssistantTemplate.tsx` to `src/app/components/YourAssistantInterface.tsx`
2. Customize the component with any special features (platform selectors, file uploads, etc.)
3. Make sure the interface extends `BaseAssistantProps`

Example of a minimal custom interface:

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { formatResponse } from '../utils/responseFormatter';
import { callAssistantWebhook } from '../utils/apiHelpers';
import { BaseAssistantProps, Message } from '../components/BaseAssistantInterface';
import LoadingSpinner from '../components/LoadingSpinner';

interface MyNewAssistantInterfaceProps extends BaseAssistantProps {}

export default function MyNewAssistantInterface({ tool, onClose }: MyNewAssistantInterfaceProps) {
  // ... component implementation (copy from template) ...
}
```

### 3. Add the Assistant to the Factory

Open `src/app/components/AssistantFactory.tsx` and add your assistant to the switch statement:

```typescript
export default function AssistantFactory({ tool, onClose }: AssistantFactoryProps): ReactNode {
  switch (tool.id) {
    case 'xthreads':
      return <XThreadsInterface tool={tool} onClose={onClose} />;
      
    // Add your new assistant here
    case 'myNewAssistant':
      return <MyNewAssistantInterface tool={tool} onClose={onClose} />;
      
    // Default to base assistant interface
    default:
      return <BaseAssistantInterface tool={tool} onClose={onClose} />;
  }
}
```

If you're using the base interface without customization, you can skip this step and let it fall through to the default case.

### 4. Register the Assistant

Open `src/app/utils/agentRegistry.ts` and add your assistant to the registry:

```typescript
let agents: Tool[] = [
  // ... existing agents ...
  {
    id: 'myNewAssistant',
    name: 'My New Assistant',
    description: 'An AI assistant that helps with specific tasks.',
    icon: '🤖', // Use any emoji or icon that represents your assistant
    webhookUrl: '/api/agents/myNewAssistant', // This is the API route, not the webhook URL
  },
];
```

## Advanced Customization

### Custom Response Formatting

If your assistant returns responses in a unique format, you can extend the `formatResponse` function in `src/app/utils/responseFormatter.ts`.

### Additional API Parameters

To send custom parameters to your webhook, modify the `callAssistantWebhook` call in your interface:

```typescript
const result = await callAssistantWebhook(tool.id, inputValue, {
  customParam1: 'value1',
  customParam2: 'value2',
});
```

### Creating an API Route (Optional)

If you need custom backend processing before calling your webhook, create an API route:

1. Create `src/app/api/agents/myNewAssistant/route.ts`
2. Implement the POST handler with your custom logic

Example API route:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, toolId } = body;
    
    // Your custom processing here
    
    // Call your webhook
    const response = await fetch('your-webhook-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, toolId, customParam: 'value' }),
    });
    
    const data = await response.text();
    
    return NextResponse.json({
      message: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

## Benefits of This Architecture

- **Reduced Code Duplication**: Common functionality is now in reusable utilities
- **Standardized Error Handling**: All assistants use the same robust error handling
- **Consistent UX**: Loading indicators and error displays are standardized
- **Simplified Maintenance**: Changes to shared functionality only need to be made in one place
- **Easy Extension**: Adding new assistants requires minimal code changes
</rewritten_file>
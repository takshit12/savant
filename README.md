# Savant Tools UI

A scalable UI platform for multiple AI tools and agents built with Next.js and React.

## Features

- Clean, responsive UI for accessing multiple AI tools/agents
- Dynamic loading of available tools
- Chat interface for interacting with each tool
- Webhooks for handling agent-specific requests
- Scalable architecture for adding new agents

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000 in your browser

## Project Structure

```
src/
├── app/
│   ├── api/                  # API routes for handling server-side logic
│   │   └── agents/           # Agent-specific API routes
│   │   └── agents/[id]/      # Dynamic routes for individual agent operations
│   ├── components/           # React components
│   │   ├── ChatInterface.tsx # Chat UI for agent interaction
│   │   ├── MainLayout.tsx    # Main layout wrapper
│   │   ├── ToolGrid.tsx      # Grid display of available tools
│   │   └── ToolManagement.tsx # Tool state management component
│   ├── hooks/                # Custom React hooks
│   │   └── useTools.ts       # Hook for tool state management
│   ├── types/                # TypeScript type definitions
│   │   └── Tool.ts           # Tool interface definition
│   ├── utils/                # Utility functions
│   │   └── agentRegistry.ts  # Registry for managing available agents
│   ├── globals.css           # Global CSS styles
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main page component
├── .env.local                # Environment variables
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Adding a New Agent

### Method 1: Using the API

Send a POST request to `/api/agents` with the following JSON structure:

```json
{
  "id": "unique-agent-id",
  "name": "Agent Name",
  "description": "Description of what this agent does",
  "icon": "🔧", // An emoji or icon character
  "webhookUrl": "/api/agents/your-agent-path"
}
```

### Method 2: Directly in the Code

1. Create an API route handler in `src/app/api/agents/your-agent-name/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // Your agent logic here
    // Call your AI service/API
    
    const response = {
      message: `Your Agent: Response to "${message}"`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in your agent API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

2. Add the agent to the registry by importing and using the `addAgent` function:

```typescript
import { addAgent } from '@/app/utils/agentRegistry';

// Add the new agent
addAgent({
  id: 'your-agent-id',
  name: 'Your Agent Name',
  description: 'Description of your agent',
  icon: '🔧',
  webhookUrl: '/api/agents/your-agent-name',
});
```

## Architecture

- `src/app/components/` - UI components
- `src/app/types/` - TypeScript type definitions
- `src/app/utils/` - Utility functions and agent registry
- `src/app/api/agents/` - API routes for agent communication
- `src/app/api/agents/[id]/` - Dynamic routes for individual agent operations

## Customization

- Update CSS in `src/app/globals.css` to change the look and feel
- Modify the `Tool` interface in `src/app/types/Tool.ts` to add more properties

## License

MIT 
'use client';

import { ReactNode } from 'react';
import { Tool } from '../types/Tool';
import BaseAssistantInterface from './BaseAssistantInterface';
import XThreadsInterface from './XThreadsInterface';
import PodcastFlowInterface from './PodcastFlowInterface';

type AssistantFactoryProps = {
  tool: Tool;
  onClose: () => void;
};

/**
 * Factory component that returns the appropriate interface 
 * for each assistant based on its ID
 */
export default function AssistantFactory({ tool, onClose }: AssistantFactoryProps): ReactNode {
  // Select the appropriate interface based on the tool ID
  switch (tool.id) {
    case 'xthreads':
      return <XThreadsInterface tool={tool} onClose={onClose} />;
    case 'podcastflow':
      return <PodcastFlowInterface tool={tool} onClose={onClose} />;
      
    // Add new assistants here
    // case 'your-new-assistant-id':
    //   return <YourNewAssistantInterface tool={tool} onClose={onClose} />;
      
    // Default to base assistant interface
    default:
      return <BaseAssistantInterface tool={tool} onClose={onClose} />;
  }
}

/**
 * Helper to add a new assistant to the system:
 * 1. Add its webhook URL to src/app/utils/apiHelpers.ts in the WEBHOOK_URLS object
 * 2. Create a custom interface component if needed (or use BaseAssistantInterface)
 * 3. Add the case to the switch statement above
 * 4. Add the assistant to the registry in src/app/utils/agentRegistry.ts
 */ 
import { Tool } from '../types/Tool';

// In-memory registry for agents
// In a production app, this would likely be stored in a database
let agents: Tool[] = [
  {
    id: 'agent1',
    name: 'General Assistant',
    description: 'A general-purpose AI assistant that can help with various tasks.',
    icon: '🤖',
    webhookUrl: '/api/agents/general',
  },
  {
    id: 'agent2',
    name: 'Code Helper',
    description: 'An AI assistant specialized in helping with programming tasks.',
    icon: '👨‍💻',
    webhookUrl: '/api/agents/code',
  },
  {
    id: 'agent3',
    name: 'Writing Assistant',
    description: 'An AI assistant that helps with writing and content creation.',
    icon: '✍️',
    webhookUrl: '/api/agents/writing',
  },
  {
    id: 'xthreads',
    name: 'X/Threads Assistant',
    description: 'An AI assistant that helps generate content for X (Twitter) and Threads posts.',
    icon: '🐦',
    webhookUrl: '/api/agents/xthreads',
  },
  {
    id: 'podcastflow',
    name: 'Podcast Flow Strategist',
    description: 'Plan, structure, and optimize your podcast content with AI assistance',
    icon: '🎙️',
    category: 'content',
  },
];

/**
 * Get all registered agents
 */
export function getAllAgents(): Tool[] {
  return [...agents];
}

/**
 * Add a new agent to the registry
 */
export function addAgent(agent: Tool): Tool {
  // Ensure the ID is unique
  if (agents.some(a => a.id === agent.id)) {
    throw new Error(`Agent with ID ${agent.id} already exists`);
  }
  
  agents.push(agent);
  return agent;
}

/**
 * Get an agent by ID
 */
export function getAgentById(id: string): Tool | undefined {
  return agents.find(agent => agent.id === id);
}

/**
 * Remove an agent by ID
 */
export function removeAgentById(id: string): boolean {
  const initialLength = agents.length;
  agents = agents.filter(agent => agent.id !== id);
  return agents.length < initialLength;
}

/**
 * Update an existing agent
 */
export function updateAgent(id: string, updates: Partial<Omit<Tool, 'id'>>): Tool | null {
  const agentIndex = agents.findIndex(agent => agent.id === id);
  
  if (agentIndex === -1) {
    return null;
  }
  
  const updatedAgent = {
    ...agents[agentIndex],
    ...updates,
  };
  
  agents[agentIndex] = updatedAgent;
  return updatedAgent;
} 
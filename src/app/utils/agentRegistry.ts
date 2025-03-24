import { Tool } from '../types/Tool';

// In-memory registry for agents
// In a production app, this would likely be stored in a database
let agents: Tool[] = [
  {
    id: 'xthreads',
    name: 'X/Threads Assistant',
    description: 'An AI assistant that helps generate content for X (Twitter) and Threads posts.',
    icon: '🐦',
    category: 'social',
    webhookUrl: '/api/agents/xthreads',
  },
  {
    id: 'podcastflow',
    name: 'Podcast Flow Strategist',
    description: 'Plan, structure, and optimize your podcast content with AI assistance',
    icon: '🎙️',
    category: 'content',
    webhookUrl: '/api/agents/podcastflow',
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
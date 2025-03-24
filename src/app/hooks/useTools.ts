import { useState, useEffect } from 'react';
import { Tool } from '../types/Tool';
import { getAllAgents } from '../utils/agentRegistry';

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        // In a real production app, we'd fetch from the API
        // const response = await fetch('/api/agents');
        // const data = await response.json();
        // setTools(data);
        
        // For now, we'll use the local registry directly
        setTools(getAllAgents());
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  const selectTool = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const closeTool = () => {
    setSelectedTool(null);
  };

  return {
    tools,
    selectedTool,
    isLoading,
    selectTool,
    closeTool,
  };
} 
'use client';

import { useTools } from '../hooks/useTools';
import ToolGrid from './ToolGrid';
import AssistantFactory from './AssistantFactory';

interface ToolManagementProps {}

export default function ToolManagement({}: ToolManagementProps) {
  const { tools, selectedTool, isLoading, selectTool, closeTool } = useTools();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-lg">Loading tools...</div>
      </div>
    );
  }

  const renderSelectedTool = () => {
    if (!selectedTool) return null;
    
    // Use AssistantFactory to render the appropriate interface for the selected tool
    return <AssistantFactory tool={selectedTool} onClose={closeTool} />;
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Savant Tools UI
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Select a tool to start chatting with an AI assistant
        </p>
      </header>

      {selectedTool ? renderSelectedTool() : (
        <ToolGrid tools={tools} onSelectTool={selectTool} />
      )}
    </div>
  );
} 
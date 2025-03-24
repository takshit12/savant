'use client';

import ToolGrid from './ToolGrid';
import ChatInterface from './ChatInterface';
import XThreadsInterface from './XThreadsInterface';
import { useTools } from '../hooks/useTools';

interface ToolManagementProps {
  // Additional props can be added here in the future
}

export default function ToolManagement({}: ToolManagementProps) {
  const { tools, selectedTool, isLoading, selectTool, closeTool } = useTools();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-lg">Loading tools...</div>
      </div>
    );
  }

  const renderSelectedToolInterface = () => {
    if (!selectedTool) return null;

    // Use the specialized interface for X/Threads Assistant
    if (selectedTool.id === 'xthreads') {
      return <XThreadsInterface tool={selectedTool} onClose={closeTool} />;
    }

    // Use the default chat interface for other tools
    return <ChatInterface tool={selectedTool} onClose={closeTool} />;
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

      {selectedTool ? renderSelectedToolInterface() : (
        <ToolGrid tools={tools} onSelectTool={selectTool} />
      )}
    </div>
  );
} 
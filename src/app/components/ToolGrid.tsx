'use client';

import { Tool } from '../types/Tool';

interface ToolGridProps {
  tools: Tool[];
  onSelectTool: (tool: Tool) => void;
}

export default function ToolGrid({ tools, onSelectTool }: ToolGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="tool-card cursor-pointer"
          onClick={() => onSelectTool(tool)}
        >
          <div className="flex items-center justify-center mb-4 text-4xl">
            {tool.icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900">{tool.name}</h3>
          <p className="mt-2 text-sm text-gray-500">{tool.description}</p>
        </div>
      ))}
    </div>
  );
} 
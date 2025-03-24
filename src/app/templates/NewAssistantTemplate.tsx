'use client';

import { useState, useRef, useEffect } from 'react';
import { formatResponse } from '../utils/responseFormatter';
import { callAssistantWebhook } from '../utils/apiHelpers';
import { BaseAssistantProps, Message } from '../components/BaseAssistantInterface';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Template for creating a new assistant interface
 * 
 * Steps to add a new assistant:
 * 1. Copy this file and rename it (e.g., YourNewAssistantInterface.tsx)
 * 2. Add your assistant's webhook URL to src/app/utils/apiHelpers.ts in the WEBHOOK_URLS object
 * 3. Customize this component with any special features your assistant needs
 * 4. Add your assistant to the AssistantFactory in src/app/components/AssistantFactory.tsx
 * 5. Add your assistant to the registry in src/app/utils/agentRegistry.ts
 */

interface NewAssistantInterfaceProps extends BaseAssistantProps {}

export default function NewAssistantInterface({ tool, onClose }: NewAssistantInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Custom state for this assistant's specific features
  // const [customSetting, setCustomSetting] = useState<string>('default');

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    // Clear any previous errors
    setError(null);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Call the assistant webhook with any additional parameters specific to this assistant
      const result = await callAssistantWebhook(tool.id, inputValue, {
        // Add any custom parameters here
        // customParam1: 'value1',
        // customParam2: 'value2',
      });
      
      if (result.success) {
        // Format the response
        const formattedContent = formatResponse(result.data);
        
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: formattedContent,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, agentMessage]);
      } else {
        // Handle error
        setError(result.error || "Unknown error occurred");
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Error: ${result.error || "Unknown error"}${result.details ? `\n\nDetails: ${result.details}` : ''}`,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="chat-container">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{tool.icon}</span>
            <h2 className="text-xl font-semibold">{tool.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        
        <div className="chat-messages">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 text-red-700">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Custom UI elements for this assistant can go here */}
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.isUser ? 'user-message' : 'agent-message'}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {isLoading && <LoadingSpinner />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 
          Custom form elements for this assistant can go here
          For example, specialized inputs, selectors, etc.
        */}
        
        <form onSubmit={handleSendMessage} className="chat-input-container">
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-300"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
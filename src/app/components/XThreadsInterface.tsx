'use client';

import { useState, useRef, useEffect } from 'react';
import { Tool } from '../types/Tool';
import LoadingSpinner from './LoadingSpinner';
import { formatResponse } from '../utils/responseFormatter';
import { callAssistantWebhook } from '../utils/apiHelpers';
import { BaseAssistantProps, Message } from './BaseAssistantInterface';

interface XThreadsInterfaceProps extends BaseAssistantProps {}

export default function XThreadsInterface({ tool, onClose }: XThreadsInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState<'x' | 'threads'>('x');
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maxChars = platform === 'x' ? 280 : 500;

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update character count when input changes
  useEffect(() => {
    setCharCount(inputValue.length);
  }, [inputValue]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading || charCount > maxChars) return;
    
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
      // Call the assistant webhook with platform-specific parameters
      const result = await callAssistantWebhook(tool.id, inputValue, {
        platform,
        maxLength: maxChars
      });
      
      console.log("XThreadsInterface: Raw response from webhook:", result.data);
      
      if (result.success) {
        // Format the response - handle both raw string and object responses
        let responseToFormat = result.data;
        
        // If the data is nested in a message property, extract it
        if (typeof result.data === 'object' && result.data !== null && 'message' in result.data) {
          responseToFormat = result.data.message;
          console.log("XThreadsInterface: Extracted message from response object:", responseToFormat);
        }
        
        const formattedContent = formatResponse(responseToFormat);
        console.log("XThreadsInterface: Formatted content:", formattedContent);
        
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
          
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No messages yet. Enter your content idea to get optimized social posts!</p>
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
        
        <form onSubmit={handleSendMessage} className="chat-input-container">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="platform" 
                  checked={platform === 'x'} 
                  onChange={() => setPlatform('x')} 
                />
                <span>X (Twitter)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="platform" 
                  checked={platform === 'threads'} 
                  onChange={() => setPlatform('threads')} 
                />
                <span>Threads</span>
              </label>
            </div>
            <div className={`text-sm ${charCount > maxChars ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {charCount}/{maxChars}
            </div>
          </div>
          
          <div className="flex flex-col">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your content idea..."
              className={`flex-1 p-3 border ${charCount > maxChars ? 'border-red-500' : 'border-gray-300'} rounded-t-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]`}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-3 bg-primary-600 text-white rounded-b-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-300"
              disabled={isLoading || !inputValue.trim() || charCount > maxChars}
            >
              {isLoading ? 'Generating...' : 'Generate Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
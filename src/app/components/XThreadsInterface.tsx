'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Tool } from '../types/Tool';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface XThreadsInterfaceProps {
  tool: Tool;
  onClose: () => void;
}

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

  // Format raw response for display
  const formatResponse = (rawResponse: string): string => {
    try {
      // Try to parse as JSON
      if (rawResponse.trim().startsWith('[') || rawResponse.trim().startsWith('{')) {
        const parsedData = JSON.parse(rawResponse);
        
        // Check if it's an array with an output field that contains JSON string
        if (Array.isArray(parsedData) && parsedData[0]?.output) {
          let output = parsedData[0].output;
          
          // Remove boxed formatting and backticks
          output = output.replace('\\boxed{```json\n', '').replace('\n```}', '');
          
          try {
            // Parse the inner JSON
            const innerJson = JSON.parse(output);
            
            // Format thread posts to display nicely
            let formattedOutput = "Generated Thread:\n\n";
            
            // Iterate through all properties in order if they are numbered
            const keys = Object.keys(innerJson).sort();
            for (const key of keys) {
              formattedOutput += `${innerJson[key]}\n\n`;
            }
            
            return formattedOutput;
          } catch (e) {
            // If inner parsing fails, return cleaned output
            return output;
          }
        }
        
        // Regular JSON formatting
        return JSON.stringify(parsedData, null, 2);
      }
      
      // Return unmodified if not JSON
      return rawResponse;
    } catch (e) {
      console.error('Error formatting response:', e);
      // Return original response if parsing fails
      return rawResponse;
    }
  };

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
      console.log(`XThreadsInterface: Sending request to ${tool.webhookUrl} for platform: ${platform}`);
      
      // Call the webhook for this specific tool
      const response = await axios.post(tool.webhookUrl, {
        message: inputValue,
        toolId: tool.id,
        platform: platform,
      });
      
      console.log('XThreadsInterface: Received response:', response.status);
      console.log('XThreadsInterface: Response data:', response.data);
      
      // Check if we have a message in the response
      if (!response.data || (!response.data.message && response.data.message !== '')) {
        throw new Error('Invalid response format: missing message');
      }
      
      // Format the response message for better display
      const formattedContent = formatResponse(response.data.message);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: formattedContent,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error('XThreadsInterface: Error sending message:', error);
      
      let errorContent = "Sorry, there was an error processing your request.";
      
      // Try to extract more detailed error information
      if (axios.isAxiosError(error) && error.response) {
        console.error('XThreadsInterface: Error response data:', error.response.data);
        
        if (error.response.data.error) {
          errorContent = `Error: ${error.response.data.error}`;
          if (error.response.data.details) {
            errorContent += `\n\nDetails: ${error.response.data.details}`;
          }
        }
        
        setError(`HTTP Error ${error.response.status}: ${error.response.statusText}`);
      } else if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
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
            messages.map((message) => (
              <div
                key={message.id}
                className={message.isUser ? 'user-message' : 'agent-message'}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))
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
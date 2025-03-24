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

interface ChatInterfaceProps {
  tool: Tool;
  onClose: () => void;
}

export default function ChatInterface({ tool, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
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
      // Call the webhook for this specific tool
      const response = await axios.post(tool.webhookUrl, {
        message: inputValue,
        toolId: tool.id,
      });
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.message || "Sorry, I couldn't process that request.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your request.",
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
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={message.isUser ? 'user-message' : 'agent-message'}
              >
                <p>{message.content}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
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
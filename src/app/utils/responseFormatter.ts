/**
 * Utility function to format various response formats from different assistants
 * This centralizes the formatting logic to be reused by any assistant interface
 */
export function formatResponse(rawResponse: string): string {
  try {
    console.log("ResponseFormatter: Raw response to format:", rawResponse);
    
    // Handle empty responses
    if (!rawResponse || rawResponse.trim() === '') {
      return "No response content received.";
    }
    
    // Clean up the boxed format
    if (rawResponse.includes('\\boxed{')) {
      // Extract content from between \boxed{ and the last }
      let content = rawResponse.replace('\\boxed{', '').trim();
      
      // Remove the last closing brace if it exists
      if (content.endsWith('}')) {
        content = content.substring(0, content.length - 1).trim();
      }
      
      console.log("ResponseFormatter: Extracted from boxed format:", content);
      return content;
    }
    
    // Try to parse as JSON if it starts with [ or {
    if (rawResponse.trim().startsWith('[') || rawResponse.trim().startsWith('{')) {
      try {
        const parsedData = JSON.parse(rawResponse);
        
        // Handle the specific format with an array containing an object with "output" property
        if (Array.isArray(parsedData) && parsedData[0]?.output) {
          let output = parsedData[0].output;
          
          // First, handle the double backslash before newline
          output = output.replace(/\\\\n/g, '\n');
          
          // Then handle any remaining escaped newlines
          output = output.replace(/\\n/g, '\n');
          
          // Remove any trailing curly brace from JSON
          if (output.endsWith('}')) {
            output = output.substring(0, output.length - 1).trim();
          }
          
          // If the content has proper line breaks, return it as is
          if (output.includes('\n\n')) {
            return output.trim();
          }
          
          // Otherwise format it with proper spacing
          const lines = output.split('\n').filter((line: string) => line.trim() !== '');
          return lines.join('\n\n');
        }
        
        // If it's a simple array of messages
        if (Array.isArray(parsedData)) {
          const messages = parsedData.map(item => {
            if (typeof item === 'string') return item;
            return item.text || item.content || item.message || item.output || JSON.stringify(item);
          });
          return messages.join('\n\n');
        }
        
        // If it's an object with a message/text/content field
        if (typeof parsedData === 'object' && parsedData !== null) {
          return parsedData.message || parsedData.text || parsedData.content || JSON.stringify(parsedData, null, 2);
        }
        
        // Default JSON stringification
        return JSON.stringify(parsedData, null, 2);
      } catch (e) {
        console.error("ResponseFormatter: Error parsing JSON:", e);
        return rawResponse;
      }
    }
    
    // Return unmodified if not handled by other cases
    return rawResponse;
  } catch (e) {
    console.error('ResponseFormatter: Error formatting response:', e);
    return rawResponse || "No response content received.";
  }
} 
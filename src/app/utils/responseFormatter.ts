/**
 * Utility function to format various response formats from different assistants
 * This centralizes the formatting logic to be reused by any assistant interface
 */

// Helper function to clean content from markdown code blocks and other formatting
function cleanContent(content: string): string {
  // First remove the boxed wrapper if it exists
  if (content.includes('\\boxed{')) {
    content = content.replace('\\boxed{', '').trim();
    // Remove the last closing brace if it exists
    if (content.endsWith('}')) {
      content = content.substring(0, content.length - 1).trim();
    }
  }
  
  // Remove markdown code blocks if present (accounting for possible newlines before the block)
  content = content.replace(/^\s*```markdown\n|^\s*```md\n/m, '');
  content = content.replace(/\n\s*```\s*$/m, '');
  
  // Handle other language code blocks
  content = content.replace(/^\s*```[a-zA-Z]*\n/m, '');
  content = content.replace(/\n\s*```\s*$/m, '');
  
  return content.trim();
}

export function formatResponse(rawResponse: any): string {
  try {
    console.log("ResponseFormatter: Raw response to format:", rawResponse);
    
    // Handle empty responses
    if (!rawResponse) {
      return "No response content received.";
    }
    
    // Convert to string if not already a string
    const responseAsString = typeof rawResponse === 'string' 
      ? rawResponse 
      : JSON.stringify(rawResponse);
    
    // Handle empty string after conversion
    if (responseAsString.trim() === '') {
      return "No response content received.";
    }
    
    // Handle the case where a raw string contains what looks like escaped JSON
    // This happens when the API route returns the raw response from the webhook
    if (responseAsString.includes('[{"output"') || responseAsString.includes('{"output"')) {
      console.log("ResponseFormatter: Detected raw string with escaped JSON");
      
      try {
        // Parse the string as JSON (this will handle a single level of escaping)
        const parsedData = JSON.parse(responseAsString);
        
        // Check if we have the expected format
        if (Array.isArray(parsedData) && parsedData[0]?.output) {
          let output = parsedData[0].output;
          
          // First, handle the double backslash before newline
          output = output.replace(/\\\\n/g, '\n');
          
          // Then handle any remaining escaped newlines
          output = output.replace(/\\n/g, '\n');
          
          // Clean any markdown and boxed formatting
          output = cleanContent(output);
          
          console.log("ResponseFormatter: Successfully processed escaped JSON output");
          return output;
        }
      } catch (e) {
        console.log("ResponseFormatter: Failed to parse as escaped JSON, continuing with other formats:", e);
      }
    }
    
    // Clean up the boxed format
    if (responseAsString.includes('\\boxed{')) {
      console.log("ResponseFormatter: Detected boxed format");
      
      // Extract content from between \boxed{ and the last }
      let content = responseAsString.replace('\\boxed{', '').trim();
      
      // Apply cleaning function to remove markdown blocks and trailing braces
      content = cleanContent(content);
      
      console.log("ResponseFormatter: Extracted from boxed format:", content);
      return content;
    }
    
    // Try to parse as JSON if it starts with [ or {
    if (responseAsString.trim().startsWith('[') || responseAsString.trim().startsWith('{')) {
      try {
        // If it's already an object (from being passed as an object), use it directly
        const parsedData = typeof rawResponse === 'object' && rawResponse !== null
          ? rawResponse
          : JSON.parse(responseAsString);
        
        // Handle the specific format with an array containing an object with "output" property
        if (Array.isArray(parsedData) && parsedData[0]?.output) {
          let output = parsedData[0].output;
          
          // Safety check - ensure output is a string
          if (typeof output !== 'string') {
            output = JSON.stringify(output);
          }
          
          // Handle newlines
          output = output.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
          
          // Clean any markdown and boxed formatting
          output = cleanContent(output);
          
          // If the content has proper line breaks, return it as is
          if (output.includes('\n\n')) {
            return output;
          }
          
          // Otherwise format it with proper spacing
          const lines = output.split('\n').filter((line: string) => line.trim() !== '');
          return lines.join('\n\n');
        }
        
        // If it's a simple array of messages
        if (Array.isArray(parsedData)) {
          const messages = parsedData.map(item => {
            if (typeof item === 'string') {
              return cleanContent(item);
            }
            let content = item.text || item.content || item.message || item.output || JSON.stringify(item);
            return typeof content === 'string' ? cleanContent(content) : content;
          });
          return messages.join('\n\n');
        }
        
        // If it's an object with a message/text/content field
        if (typeof parsedData === 'object' && parsedData !== null) {
          const messageContent = parsedData.message || parsedData.text || parsedData.content;
          if (messageContent) {
            const content = typeof messageContent === 'string' 
              ? messageContent 
              : JSON.stringify(messageContent);
            return cleanContent(content);
          }
          return JSON.stringify(parsedData, null, 2);
        }
        
        // Default JSON stringification
        return JSON.stringify(parsedData, null, 2);
      } catch (e) {
        console.error("ResponseFormatter: Error parsing JSON:", e);
        return cleanContent(responseAsString);
      }
    }
    
    // Return unmodified string if not handled by other cases
    return cleanContent(responseAsString);
  } catch (e) {
    console.error('ResponseFormatter: Error formatting response:', e);
    const fallbackResponse = typeof rawResponse === 'string' 
      ? rawResponse 
      : JSON.stringify(rawResponse) || "No response content received.";
    return cleanContent(fallbackResponse);
  }
} 
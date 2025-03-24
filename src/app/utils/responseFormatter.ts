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
          
          // Clean up newline escapes in the output string
          output = output.replace(/\\n/g, '\n');
          
          // Remove boxed formatting and backticks from the output field
          if (output.includes('\\boxed{')) {
            output = output
              .replace('\\boxed{', '')
              .replace(/}$/, '');
          }
          
          if (output.includes('```json')) {
            output = output
              .replace(/```json\n/, '')
              .replace(/\n```/, '');
          }
          
          // Handle any two-backslash escapes (common in JSON strings)
          output = output.replace(/\\\\/g, '\\');
          
          // Remove trailing curly brace if it exists
          if (output.endsWith('}')) {
            output = output.substring(0, output.length - 1).trim();
          }
          
          try {
            // Try to parse as JSON in case it's a JSON string
            const innerJson = JSON.parse(output);
            
            // Format thread posts to display nicely
            let formattedOutput = "Generated Content:\n\n";
            
            // Iterate through all properties in order if they are numbered
            const keys = Object.keys(innerJson).sort();
            for (const key of keys) {
              formattedOutput += `${innerJson[key]}\n\n`;
            }
            
            return formattedOutput;
          } catch (e) {
            // If inner parsing fails, check if it's a thread-like format with emojis and numbering
            // This handles the case where the output contains a thread but isn't in JSON format
            
            // Check if the content already has paragraph breaks
            const hasMultipleParagraphs = output.includes('\n\n');
            
            if (hasMultipleParagraphs) {
              // Already formatted with paragraphs, just return cleaned
              return output.trim();
            }
            
            // Split by line breaks and keep only non-empty lines
            const lines = output.split('\n').filter((line: string) => line.trim() !== '');
            
            // If there are enough lines to be a thread, format it nicely
            if (lines.length > 1) {
              return lines.join('\n\n');
            }
            
            // If we couldn't split effectively, just return the cleaned output
            return output.trim();
          }
        }
        
        // Handle direct response structure from the webhook
        // Sometimes the webhook returns an array of objects with text properties
        if (Array.isArray(parsedData)) {
          // Check if items have text/content properties
          const contentItems = parsedData.map(item => {
            return item.text || item.content || item.message || JSON.stringify(item);
          });
          
          if (contentItems.length > 0) {
            return contentItems.join('\n\n');
          }
        }
        
        // Regular JSON formatting - nicely format if it's an object
        if (typeof parsedData === 'object' && parsedData !== null) {
          // Check for common response fields
          if (parsedData.text || parsedData.content || parsedData.message) {
            return parsedData.text || parsedData.content || parsedData.message;
          }
          
          // If it's a simple object with numbered keys (like thread posts)
          const keys = Object.keys(parsedData);
          if (keys.some(key => !isNaN(Number(key)) || key.includes('/'))) {
            let formattedOutput = "";
            keys.sort().forEach(key => {
              formattedOutput += `${parsedData[key]}\n\n`;
            });
            return formattedOutput;
          }
        }
        
        // Default JSON stringification
        return JSON.stringify(parsedData, null, 2);
      } catch (e) {
        console.error("ResponseFormatter: Error parsing JSON:", e);
        // Fall through to the default return
      }
    }
    
    // Return unmodified if not handled by other cases
    return rawResponse;
  } catch (e) {
    console.error('ResponseFormatter: Error formatting response:', e);
    // Return original response if parsing fails
    return rawResponse || "No response content received.";
  }
} 
        // Handle bold text (**text**) using string parsing for better reliability
        let boldProcessedLine = '';
        let remainingLine = line;
        let startPos = 0;

        while (true) {
            // Find opening **
            const openPos = remainingLine.indexOf('**', startPos);
            if (openPos === -1) {
                boldProcessedLine += remainingLine.substring(startPos);
                break;
            }
            
            // Add text before the opening ** to the result
            boldProcessedLine += remainingLine.substring(startPos, openPos);
            
            // Find closing **
            const closePos = remainingLine.indexOf('**', openPos + 2);
            if (closePos === -1) {
                // No closing **, just add the rest as is
                boldProcessedLine += remainingLine.substring(openPos);
                break;
            }
            
            // Extract the content between ** and **
            const content = remainingLine.substring(openPos + 2, closePos);
            
            // Add the strong tag with content
            boldProcessedLine += '<strong>' + content + '</strong>';
            
            // Update the start position for next iteration
            startPos = closePos + 2;
            
            // If we've processed the whole string, break
            if (startPos >= remainingLine.length) {
                break;
            }
        }

        line = boldProcessedLine;

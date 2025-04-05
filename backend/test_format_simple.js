// Simple test script to verify the AI response formatting functionality
// This version works directly with strings rather than DOM elements

/**
 * Converts markdown-like text to HTML
 * @param {string} text - The markdown-formatted text
 * @return {string} - The HTML representation
 */
function formatAIResponseSimple(text) {
    if (!text) return '';
    
    let html = '';
    
    // Split the text into lines
    const lines = text.split('\n');
    let inOrderedList = false;
    let inUnorderedList = false;
    let listBuffer = '';
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Skip empty lines
        if (!line.trim()) {
            if (inOrderedList) {
                html += listBuffer + '</ol>\n';
                inOrderedList = false;
                listBuffer = '';
            }
            if (inUnorderedList) {
                html += listBuffer + '</ul>\n';
                inUnorderedList = false;
                listBuffer = '';
            }
            html += '<br>\n';
            continue;
        }
        
        // Handle headers (# Header)
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const headerText = headerMatch[2];
            html += `<h${level}>${headerText}</h${level}>\n`;
            continue;
        }
        
        // Handle unordered lists (* Item or - Item)
        const ulMatch = line.match(/^\s*[\*\-]\s+(.+)$/);
        if (ulMatch) {
            if (!inUnorderedList) {
                listBuffer = '<ul>\n';
                inUnorderedList = true;
            }
            
            // Handle bold and italic in list items
            let content = ulMatch[1];
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            content = content.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
            
            listBuffer += `  <li>${content}</li>\n`;
            
            // If this is the last line or the next line is not a list item
            if (i === lines.length - 1 || 
                !lines[i + 1].match(/^\s*[\*\-]\s+(.+)$/)) {
                html += listBuffer + '</ul>\n';
                inUnorderedList = false;
                listBuffer = '';
            }
            continue;
        }
        
        // Handle ordered lists (1. Item)
        const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
        if (olMatch) {
            if (!inOrderedList) {
                listBuffer = '<ol>\n';
                inOrderedList = true;
            }
            
            // Handle bold and italic in list items
            let content = olMatch[2];
            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            content = content.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
            
            listBuffer += `  <li>${content}</li>\n`;
            
            // If this is the last line or the next line is not a list item
            if (i === lines.length - 1 || 
                !lines[i + 1].match(/^\s*(\d+)\.\s+(.+)$/)) {
                html += listBuffer + '</ol>\n';
                inOrderedList = false;
                listBuffer = '';
            }
            continue;
        }
        
        // Handle bold text (**text**)
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Handle italic text (*text*)
        line = line.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        
        // Add regular paragraph text
        html += `<p>${line}</p>\n`;
    }
    
    return html;
}

// Sample AI response to test formatting
const sampleResponse = `Okay, here's a list of common cooking methods, their best uses, and their pros and cons:

**Dry Heat Methods**

* **Baking:**
  * **Best Uses:** Cakes, breads, pastries, cookies, casseroles, roasting vegetables and meats.
  * **Pros:** Even cooking, good for large quantities, relatively hands-off, can develop complex flavors.
  * **Cons:** Can be time-consuming, can dry out food if not careful, requires preheating.

* **Roasting:**
  * **Best Uses:** Large cuts of meat (roasts, poultry), vegetables.
  * **Pros:** Develops rich, browned flavors, relatively hands-off, good for large portions.
  * **Cons:** Can be time-consuming, can dry out food if not careful, requires preheating.

1. **Grilling:**
   1. **Best Uses:** Steaks, burgers, chicken, vegetables, seafood.
   2. **Pros:** Quick cooking, imparts smoky flavor, visually appealing grill marks, relatively healthy.
   3. **Cons:** Requires outdoor space (usually), can be difficult to control temperature precisely.

# Moist Heat Methods

**Boiling:**
* **Best Uses:** Pasta, rice, potatoes, vegetables
* **Pros:** Simple, consistent results, minimal equipment needed
* **Cons:** Can leach out nutrients and flavors, easy to overcook foods`;

// Format the sample response
const formattedHTML = formatAIResponseSimple(sampleResponse);

// Display the raw HTML output
console.log('Formatted HTML Output:');
console.log('-'.repeat(80));
console.log(formattedHTML);
console.log('-'.repeat(80));

// Format another simple example
const simpleExample = `# Testing Headers

This is a paragraph with **bold text** and *italic text*.

## Lists

* Item 1
* Item 2
* Item 3

1. First item
2. Second item
3. Third item`;

console.log('\nSimple Example Output:');
console.log('-'.repeat(80));
console.log(formatAIResponseSimple(simpleExample));
console.log('-'.repeat(80));


// Simple test script to verify the formatAIResponse function
// Run with: node backend/test_formatting.js

// Mock DOM methods for Node.js environment
class MockElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.textContent = '';
    this.innerHTML = '';
    this.children = [];
    this.attributes = {};
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  clone() {
    return Object.assign(new MockElement(this.tagName), this);
  }
}

// Mock document object
global.document = {
  createElement: function(tag) {
    return new MockElement(tag);
  }
};

// Copy of the formatAIResponse function from main.js
function formatAIResponse(text) {
    if (!text) return '';
    
    // Create a document fragment for safety
    const fragment = document.createElement('div');
    
    // Split the text into lines
    const lines = text.split('\n');
    let inOrderedList = false;
    let inUnorderedList = false;
    let currentList = null;
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Skip empty lines
        if (!line.trim()) {
            if (inOrderedList) {
                fragment.appendChild(currentList);
                inOrderedList = false;
                currentList = null;
            }
            if (inUnorderedList) {
                fragment.appendChild(currentList);
                inUnorderedList = false;
                currentList = null;
            }
            fragment.appendChild(document.createElement('br'));
            continue;
        }
        
        // Handle headers (# Header)
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const headerText = headerMatch[2];
            const header = document.createElement(`h${level}`);
            header.textContent = headerText;
            fragment.appendChild(header);
            continue;
        }
        
        // Handle unordered lists (* Item or - Item)
        const ulMatch = line.match(/^\s*[\*\-]\s+(.+)$/);
        if (ulMatch) {
            if (!inUnorderedList) {
                currentList = document.createElement('ul');
                inUnorderedList = true;
            }
            const li = document.createElement('li');
            li.textContent = ulMatch[1];
            currentList.appendChild(li);
            
            // If this is the last line or the next line is not a list item
            if (i === lines.length - 1 || 
                !lines[i + 1].match(/^\s*[\*\-]\s+(.+)$/)) {
                fragment.appendChild(currentList);
                inUnorderedList = false;
                currentList = null;
            }
            continue;
        }
        
        // Handle ordered lists (1. Item)
        const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
        if (olMatch) {
            if (!inOrderedList) {
                currentList = document.createElement('ol');
                inOrderedList = true;
            }
            const li = document.createElement('li');
            li.textContent = olMatch[2];
            currentList.appendChild(li);
            
            // If this is the last line or the next line is not a list item
            if (i === lines.length - 1 || 
                !lines[i + 1].match(/^\s*(\d+)\.\s+(.+)$/)) {
                fragment.appendChild(currentList);
                inOrderedList = false;
                currentList = null;
            }
            continue;
        }
        
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
        
        // Handle italic text (*text*)
        // We need to be careful not to match list items (which we already handled)
        line = line.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        
        // Add regular paragraph text
        const p = document.createElement('p');
        p.innerHTML = line; // Safe as we've only added well-formed HTML
        fragment.appendChild(p);
    }
    
    return fragment.innerHTML;
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
const formattedHTML = formatAIResponse(sampleResponse);

// Display the raw HTML output
console.log('Formatted HTML Output:');
console.log('-'.repeat(80));
console.log(formattedHTML);
console.log('-'.repeat(80));

// Create a simplified representation of the structure
function generateStructurePreview(html) {
    // Just a simple preview showing what elements are there
    const structurePreview = html
        .replace(/<h1.*?>/g, '\n[H1] ')
        .replace(/<h2.*?>/g, '\n[H2] ')
        .replace(/<h3.*?>/g, '\n[H3] ')
        .replace(/<h4.*?>/g, '\n[H4] ')
        .replace(/<\/h\d>/g, '')
        .replace(/<ul>/g, '\n[UL Start]')
        .replace(/<\/ul>/g, '[UL End]\n')
        .replace(/<ol>/g, '\n[OL Start]')
        .replace(/<\/ol>/g, '[OL End]\n')
        .replace(/<li.*?>/g, '\n  - ')
        .replace(/<\/li>/g, '')
        .replace(/<p.*?>/g, '\n[P] ')
        .replace(/<\/p>/g, '')
        .replace(/<br>/g, '\n[BR]')
        .replace(/<strong>/g, '*')
        .replace(/<\/strong>/g, '*')
        .replace(/<em>/g, '_')
        .replace(/<\/em>/g, '_');
    
    return structurePreview;
}

console.log('\nStructure Preview:');
console.log('-'.repeat(80));
console.log(generateStructurePreview(formattedHTML));
console.log('-'.repeat(80));


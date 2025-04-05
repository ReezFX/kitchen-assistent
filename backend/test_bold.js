console.log("Running bold text formatting test...");

// Implement the same processing function we added to the files
function formatBoldText(line) {
    let boldProcessedLine = "";
    let remainingLine = line;
    let startPos = 0;

    while (true) {
        // Find opening **
        const openPos = remainingLine.indexOf("**", startPos);
        if (openPos === -1) {
            boldProcessedLine += remainingLine.substring(startPos);
            break;
        }
        
        // Add text before the opening ** to the result
        boldProcessedLine += remainingLine.substring(startPos, openPos);
        
        // Find closing **
        const closePos = remainingLine.indexOf("**", openPos + 2);
        if (closePos === -1) {
            // No closing **, just add the rest as is
            boldProcessedLine += remainingLine.substring(openPos);
            break;
        }
        
        // Extract the content between ** and **
        const content = remainingLine.substring(openPos + 2, closePos);
        
        // Add the strong tag with content
        boldProcessedLine += "<strong>" + content + "</strong>";
        
        // Update the start position for next iteration
        startPos = closePos + 2;
        
        // If we have processed the whole string, break
        if (startPos >= remainingLine.length) {
            break;
        }
    }

    return boldProcessedLine;
}

// Test cases
const testCases = [
    "**example**",
    "**multiple words**",
    "Text with **bold part** in the middle",
    "Multiple **bold** sections **in one** line",
    "**Bold** and *italic* formatting",
    "**Nested *italic* within bold**",
    "No bold formatting here",
    "Incomplete **bold",
    "** Space after opening",
    "**Space before closing **"
];

console.log("Testing the new bold text formatting implementation:");
console.log("------------------------------------------------");

testCases.forEach((test, index) => {
    console.log(`Test ${index + 1}:`);
    console.log(`  Input:  ${test}`);
    console.log(`  Output: ${formatBoldText(test)}`);
    console.log();
});


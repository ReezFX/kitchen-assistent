console.log("Debug script loaded!");

// Intercept fetch requests to check for image loading issues
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    console.log(`Fetch request: ${url}`, options);
    return originalFetch.apply(this, arguments)
        .then(response => {
            console.log(`Fetch response for ${url}:`, response.status, response.statusText);
            return response;
        })
        .catch(error => {
            console.error(`Fetch error for ${url}:`, error);
            throw error;
        });
};

// Monitor image loading
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, monitoring images...");
    
    // Monitor all image elements
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'IMG') {
                        console.log(`New image added:`, node.src);
                        
                        node.addEventListener('load', () => {
                            console.log(`Image loaded successfully: ${node.src}`);
                            console.log(`Image dimensions: ${node.naturalWidth}x${node.naturalHeight}`);
                        });
                        
                        node.addEventListener('error', () => {
                            console.error(`Error loading image: ${node.src}`);
                        });
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Log existing images
    document.querySelectorAll('img').forEach(img => {
        console.log(`Existing image: ${img.src}`);
        console.log(`Image complete: ${img.complete}, naturalWidth: ${img.naturalWidth}`);
    });
});

// Add the debug script to index.html page
console.log("Current page URL:", window.location.href);
console.log("Recipe image dirs should be at:", '/static/img/recipes/');

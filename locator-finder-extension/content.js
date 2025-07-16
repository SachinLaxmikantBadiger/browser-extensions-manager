// content.js
function elementSelector(e) {
    e.preventDefault();
    e.stopPropagation();

    // Get the element and its parent's outerHTML to provide context to the AI
    const targetElement = e.target;
    const contextHTML = targetElement.parentElement.outerHTML;

    // Send the HTML back to the popup script
    chrome.runtime.sendMessage({
        action: "elementSelected",
        htmlContent: contextHTML
    });

    // Clean up listeners
    document.body.style.cursor = 'default';
    document.removeEventListener('click', elementSelector, true);
}

// Add a listener and change cursor to indicate selection mode
document.body.style.cursor = 'crosshair';
document.addEventListener('click', elementSelector, true);
// popup.js
const selectElementBtn = document.getElementById('selectElementBtn');
const loadingText = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const errorText = document.getElementById('error');
const locatorInput = document.getElementById('locatorInput');
const copyBtn = document.getElementById('copyBtn');

// Use the local backend for development
const API_URL = 'http://localhost:3001/api/find-locator';
// LATER: Replace with 'https://your-deployed-backend-url.com/api/find-locator'

// 1. When the "Select Element" button is clicked
selectElementBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject the content script into the active tab
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    });

    // Close the popup
    window.close();
});

// 2. Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "elementSelected") {
        showLoading();
        findLocator(request.htmlContent);
    }
});

// 3. Call our backend API
async function findLocator(htmlContent) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ htmlContent })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        showResult(data.locator);

    } catch (err) {
        showError(err.message);
    }
}

// 4. UI update functions
function showLoading() {
    loadingText.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    errorText.classList.add('hidden');
}

function showResult(locator) {
    loadingText.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    locatorInput.value = locator;
}

function showError(message) {
    loadingText.classList.add('hidden');
    errorText.textContent = `Error: ${message}`;
    errorText.classList.remove('hidden');
}

// 5. Copy to clipboard
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(locatorInput.value);
        // Optional: Provide feedback to user, e.g., temporarily change button text
        // const originalText = copyBtn.textContent;
        // copyBtn.textContent = 'Copied!';
        // setTimeout(() => { copyBtn.textContent = originalText; }, 1000);
    } catch (err) {
        showError('Failed to copy to clipboard');
    }
});
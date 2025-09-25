/**
 * background.js - Listens for messages from the content script.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handles the old "openTab" action if needed, though it's deprecated.
    if (request.action === 'openTab') {
        chrome.tabs.create({
            url: request.url
        });
    }
    // Listens for a request to fetch a URL.
    // This is used to bypass content script security limitations for network requests.
    else if (request.action === 'fetchUrl') {
        fetch(request.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => sendResponse({
                success: true,
                data: text
            }))
            .catch(error => sendResponse({
                success: false,
                error: error.message
            }));
        return true; // Required to indicate an asynchronous response.
    }
});


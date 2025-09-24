/**
 * background.js - Service Worker
 *
 * This script handles tasks that require browser-level API access,
 * such as creating new tabs. It listens for messages from content scripts.
 */

// Listen for a message from any content script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Verify the message is the one we expect: 'openTab' with a URL.
  if (message.action === 'openTab' && message.url) {
    // Use the Chrome Tabs API to create a new tab.
    chrome.tabs.create({
      url: message.url,
      active: true // Make the new tab focused.
    });
  }
  // Note: It's good practice to return true for asynchronous sendResponse,
  // but we don't need to send a response here.
});

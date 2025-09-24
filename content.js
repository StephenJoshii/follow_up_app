/**
 * Reel Follow-Up: content.js
 * * This script is injected into Instagram pages. Its primary responsibilities are:
 * 1. To observe the page for when new Reel videos are loaded into the DOM.
 * 2. To inject a "Find Next Part" button into the UI for each Reel.
 * 3. When the button is clicked, to scrape the creator's username and the Reel's caption.
 * 4. To construct a Google search query based on the scraped data.
 * 5. To send a message to the background script (background.js) to open the search results in a new tab.
 */

// A helper function to create our custom button. This makes the code cleaner.
function createFollowUpButton() {
    const button = document.createElement('button');
    button.className = 'reel-follow-up-btn'; // Custom class for styling
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.padding = '8px';
    button.title = 'Find Next Part'; // Tooltip on hover

    // Using an SVG for the icon so we don't need to manage image files yet.
    // This is a "fast-forward" icon.
    button.innerHTML = `
        <svg aria-label="Find Next Part" class="x1lliihq x1n2onr6 xyb1xck" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <title>Find Next Part</title>
            <path d="M7.201 4.501a1.037 1.037 0 0 0-1.037 1.037v12.924a1.037 1.037 0 0 0 1.556.898l9.622-6.462a1.037 1.037 0 0 0 0-1.796L8.096 4.58A1.037 1.037 0 0 0 7.2 4.5m1.038 2.337 6.98 4.653-6.98 4.653V6.838m7.761-2.337a1.037 1.037 0 0 0-1.037 1.037v12.924a1.037 1.037 0 0 0 1.556.898l9.622-6.462a1.037 1.037 0 0 0 0-1.796L16.475 4.58a1.037 1.037 0 0 0-.476-.118Z"></path>
        </svg>
    `;
    return button;
}

// This function handles the main logic when our button is clicked.
function handleButtonClick(event) {
    // Find the main article element for the Reel. We traverse up from the button.
    const articleElement = event.currentTarget.closest('article');
    if (!articleElement) {
        console.error("Reel Follow-Up: Could not find the article element.");
        return;
    }

    // 1. Scrape the Creator's Username
    // The username is typically in a link inside the header of the article.
    const usernameLink = articleElement.querySelector('header a[role="link"]');
    const username = usernameLink ? usernameLink.textContent.trim() : '';

    // 2. Scrape the Video Caption
    // The caption is often in an H1 tag.
    const captionElement = articleElement.querySelector('h1');
    let caption = captionElement ? captionElement.textContent.trim() : '';
    
    // A simple cleanup: remove hashtags to make the search query cleaner.
    caption = caption.replace(/#\w+/g, '');

    if (!username || !caption) {
        console.error("Reel Follow-Up: Could not find username or caption.");
        return;
    }

    // 3. Construct the Google Search Query
    // We combine the username and caption and add common "next part" phrases.
    const searchQuery = `${username} ${caption} part 2`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    // 4. Send the URL to the background script to open a new tab
    chrome.runtime.sendMessage({
        action: 'openTab',
        url: googleSearchUrl
    });
}

// This function finds Reels and adds our button to them.
function addButtonsToReels() {
    // Instagram's Reel containers are often <article> elements.
    const articles = document.querySelectorAll('article');

    articles.forEach(article => {
        // Check if this article is a Reel and if we haven't already added a button.
        // We add a custom attribute to mark articles we've already processed.
        if (article.querySelector('video') && !article.dataset.reelFollowUpButtonAdded) {
            
            // Mark this article as processed.
            article.dataset.reelFollowUpButtonAdded = 'true';

            // Find the area where the "like", "comment", and "share" buttons are.
            const actionsContainer = article.querySelector('section > .x1i10hfl');
            if (actionsContainer) {
                const newButton = createFollowUpButton();
                newButton.addEventListener('click', handleButtonClick);
                // Insert our button right after the "like" button.
                actionsContainer.parentElement.insertBefore(newButton, actionsContainer.nextSibling);
            }
        }
    });
}

// Instagram is a single-page app, so content loads dynamically.
// We need to use a MutationObserver to watch for changes to the page.
const observer = new MutationObserver((mutations) => {
    // We don't need to inspect the mutations themselves, just run our function
    // whenever the DOM changes to see if new Reels have been loaded.
    addButtonsToReels();
});

// Start observing the entire body of the page for changes.
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Run the function once when the script is first injected, just in case
// some Reels are already on the page.
addButtonsToReels();

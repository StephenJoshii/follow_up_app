/**
 * Injects a "Find Next Part" button onto Instagram Reels.
 * This script relies on the structural layout of the page to remain
 * functional across Instagram's frequent UI updates.
 */

/**
 * Creates the "Find Next Part" button element, mimicking Instagram's UI.
 * @returns {HTMLDivElement} A div element styled as a button.
 */
function createFollowUpButton() {
    // Create a wrapper div to match the structure of Instagram's action buttons.
    const wrapper = document.createElement('div');
    wrapper.className = 'reel-follow-up-btn-wrapper';
    wrapper.setAttribute('role', 'button');
    wrapper.setAttribute('tabindex', '0');
    
    // Apply styles to match other buttons. This is crucial for alignment.
    wrapper.style.cursor = 'pointer';
    wrapper.style.padding = '8px';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.title = 'Find Next Part';

    // The SVG icon remains the same.
    wrapper.innerHTML = `
        <svg aria-label="Find Next Part" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <title>Find Next Part</title>
            <path d="M7.201 4.501a1.037 1.037 0 0 0-1.037 1.037v12.924a1.037 1.037 0 0 0 1.556.898l9.622-6.462a1.037 1.037 0 0 0 0-1.796L8.096 4.58A1.037 1.037 0 0 0 7.2 4.5m1.038 2.337 6.98 4.653-6.98 4.653V6.838m7.761-2.337a1.037 1.037 0 0 0-1.037 1.037v12.924a1.037 1.037 0 0 0 1.556.898l9.622-6.462a1.037 1.037 0 0 0 0-1.796L16.475 4.58a1.037 1.037 0 0 0-.476-.118Z"></path>
        </svg>
    `;
    return wrapper;
}

/**
 * Handles the button click event by finding the post's username and caption,
 * then opening a Google search in a new tab.
 * @param {MouseEvent} event The click event.
 */
function handleButtonClick(event) {
    const postContainer = event.currentTarget.closest('div:has(video):has(a[href*="/reels/"])');
    if (!postContainer) {
        console.error("Reel Follow-Up: Could not find the main post container.");
        return;
    }

    const profilePicElement = postContainer.querySelector('img[alt*="profile picture"]');
    let username = '';
    if (profilePicElement) {
        username = profilePicElement.alt.replace("'s profile picture", "").trim();
    }

    const captionElement = postContainer.querySelector('div[dir="auto"] > span');
    let caption = captionElement ? captionElement.textContent.trim() : '';
    caption = caption.replace(/#\w+/g, '').replace(/@\w+/g, '');

    if (!username || !caption) {
        console.error("Reel Follow-Up: Could not extract username or caption.", { username, caption });
        return;
    }

    const searchQuery = `${username} ${caption} part 2`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    chrome.runtime.sendMessage({ action: 'openTab', url: googleSearchUrl });
}

/**
 * Finds Reel action-button containers and injects the follow-up button.
 */
function addButtonsToReels() {
    // A reliable selector for the actions bar is a div containing both Like and Comment buttons.
    const actionContainers = document.querySelectorAll('div:has(svg[aria-label="Like"]):has(svg[aria-label="Comment"])');

    actionContainers.forEach(container => {
        // Check if our button has already been added to this container.
        if (!container.querySelector('.reel-follow-up-btn-wrapper')) {
            const newButton = createFollowUpButton();
            newButton.addEventListener('click', handleButtonClick);

            // Find the Share button to position our button correctly before it.
            const shareButtonWrapper = container.querySelector('svg[aria-label="Share"]').closest('div[role="button"]');
            
            if (shareButtonWrapper && shareButtonWrapper.parentElement) {
                 // Insert our button before the Share button's wrapper for perfect integration.
                 shareButtonWrapper.parentElement.insertBefore(newButton, shareButtonWrapper);
            }
        }
    });
}

const observer = new MutationObserver(() => {
    addButtonsToReels();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

addButtonsToReels();


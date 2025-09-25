/**
 * Reel Follow-Up: content.js (with debugging)
 */

// DEBUGGING MESSAGE 1: Check if the script is running at all.
console.log("Reel Follow-Up: content.js script injected and running.");

function createFollowUpButton() {
    const button = document.createElement('button');
    button.className = 'reel-follow-up-btn';
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.padding = '8px';
    button.title = 'Find Next Part';
    button.innerHTML = `
        <svg aria-label="Find Next Part" class="x1lliihq x1n2onr6 xyb1xck" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <title>Find Next Part</title>
            <path d="M7.201 4.501a1.037 1.037 0 0 0-1.037 1.037v12.924a1.037 1.037 0 0 0 1.556.898l9.622-6.462a1.037 1.037 0 0 0 0-1.796L8.096 4.58A1.037 1.037 0 0 0 7.2 4.5m1.038 2.337 6.98 4.653-6.98 4.653V6.838m7.761-2.337a1.037 1.037 0 0 0-1.037 1.037v12.924a1.037 1.037 0 0 0 1.556.898l9.622-6.462a1.037 1.037 0 0 0 0-1.796L16.475 4.58a1.037 1.037 0 0 0-.476-.118Z"></path>
        </svg>
    `;
    return button;
}

function handleButtonClick(event) {
    const articleElement = event.currentTarget.closest('article');
    if (!articleElement) {
        console.error("Reel Follow-Up: Could not find the article element.");
        return;
    }
    const usernameLink = articleElement.querySelector('header a[role="link"]');
    const username = usernameLink ? usernameLink.textContent.trim() : '';
    const captionElement = articleElement.querySelector('h1');
    let caption = captionElement ? captionElement.textContent.trim() : '';
    caption = caption.replace(/#\w+/g, '');

    if (!username || !caption) {
        console.error("Reel Follow-Up: Could not find username or caption.");
        return;
    }
    const searchQuery = `${username} ${caption} part 2`;
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    chrome.runtime.sendMessage({ action: 'openTab', url: googleSearchUrl });
}

function addButtonsToReels() {
    const articles = document.querySelectorAll('article');
    // DEBUGGING MESSAGE 2: Check if we are finding any article elements.
    if (articles.length > 0) {
        console.log(`Reel Follow-Up: Found ${articles.length} <article> elements.`);
    }

    articles.forEach(article => {
        if (article.querySelector('video') && !article.dataset.reelFollowUpButtonAdded) {
            article.dataset.reelFollowUpButtonAdded = 'true';
            
            // This selector is the most likely point of failure.
            const actionsContainer = article.querySelector('section > .x1i10hfl');
            
            if (actionsContainer) {
                // DEBUGGING MESSAGE 3: This will only appear if we successfully find the container.
                console.log("Reel Follow-Up: SUCCESS! Found actions container. Injecting button.", article);
                const newButton = createFollowUpButton();
                newButton.addEventListener('click', handleButtonClick);
                actionsContainer.parentElement.insertBefore(newButton, actionsContainer.nextSibling);
            } else {
                // DEBUGGING MESSAGE 4: This will tell us our selector failed for a specific Reel.
                console.warn("Reel Follow-Up: Could not find the actions container for a Reel. The class name has likely changed.", article);
            }
        }
    });
}

const observer = new MutationObserver((mutations) => {
    addButtonsToReels();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

addButtonsToReels();


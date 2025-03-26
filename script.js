// GameSnack.fun - Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize game cards
    initGameCards();
    
    // Add any future functionality here
});

/**
 * Initialize game cards with click events
 */
function initGameCards() {
    const gameCards = document.querySelectorAll('.game-card');
    const featuredGameContainer = document.querySelector('.featured-game .game-container');
    
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameName = card.querySelector('h3').textContent;
            console.log(`${gameName} clicked! Loading game...`);
            
            // Clear the featured game container
            featuredGameContainer.innerHTML = '';
            
            // Create and load the appropriate game iframe based on the game name
            if (gameName === 'Slice It Clean') {
                const iframe = document.createElement('iframe');
                iframe.src = '/games/slice-it-clean/index.html';
                iframe.frameBorder = '0';
                iframe.width = '100%';
                iframe.height = '400';
                featuredGameContainer.appendChild(iframe);
            } else {
                // For games that aren't implemented yet
                const placeholder = document.createElement('div');
                placeholder.className = 'iframe-placeholder';
                placeholder.innerHTML = `
                    <p>${gameName}</p>
                    <p class="coming-soon">Coming Soon!</p>
                `;
                featuredGameContainer.appendChild(placeholder);
            }
        });
    });
}

/**
 * Future enhancement: Add game filtering functionality
 */
function filterGames(category) {
    // This will be implemented in the future
    console.log(`Filtering by ${category}`);
}

/**
 * Future enhancement: Randomizer to play a random game
 */
function playRandomGame() {
    // This will be implemented in the future
    const gameCards = document.querySelectorAll('.game-card');
    const randomIndex = Math.floor(Math.random() * gameCards.length);
    
    console.log('Random game selected!');
    // Simulate click on random game
    gameCards[randomIndex].click();
}
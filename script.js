// Game Library Script
document.addEventListener('DOMContentLoaded', () => {
    console.log('GameSnack.fun is ready to play!');
    
    // Initialize game cards
    initGameCards();
    
    // Initialize featured game section
    initFeaturedGame();
});

// Initialize game cards with click functionality
function initGameCards() {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach((card) => {
        card.addEventListener('click', function() {
            const gameName = card.querySelector('h3').textContent.trim();
            console.log(`${gameName} clicked! Opening game...`);
            
            // Only Brain Tax is available, rickroll for others
            if (gameName === 'Brain Tax') {
                window.location.href = 'games/brain-tax/index.html';
            } else {
                // Rickroll for all other games
                rickrollWithComingSoon(gameName);
            }
        });
    });
}

// Initialize featured game button
function initFeaturedGame() {
    const playFeaturedBtn = document.getElementById('playFeaturedGame');
    const featuredTitle = document.querySelector('.featured-title');
    
    if (playFeaturedBtn) {
        playFeaturedBtn.addEventListener('click', function() {
            const gameName = featuredTitle ? featuredTitle.textContent : 'Brain Tax';
            console.log(`Play button clicked! Loading ${gameName}...`);
            
            window.location.href = 'games/brain-tax/index.html';
        });
    }
}

// Function to rickroll users with a coming soon message
function rickrollWithComingSoon(gameName) {
    console.log(`Rickrolling for ${gameName}`);
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'rickroll-overlay';
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = `${gameName} - Coming Soon!`;
    title.className = 'rickroll-title';
    
    // Create YouTube embed for rickroll
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.id = 'rickroll-video';
    iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; clipboard-write; gyroscope; picture-in-picture');
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    
    // Create fallback button in case autoplay is blocked
    const fallbackButton = document.createElement('button');
    fallbackButton.textContent = 'Click to Play Video';
    fallbackButton.className = 'play-button fallback-button';
    fallbackButton.style.position = 'absolute';
    fallbackButton.style.top = '50%';
    fallbackButton.style.left = '50%';
    fallbackButton.style.transform = 'translate(-50%, -50%)';
    fallbackButton.style.zIndex = '2';
    fallbackButton.addEventListener('click', function() {
        iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0';
        this.style.display = 'none';
    });
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.className = 'play-button close-button';
    closeButton.addEventListener('click', function() {
        // Add a pixelated fade-out effect
        overlay.style.animation = 'pixel-fade-out 0.5s forwards';
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 500);
    });
    
    // Add notification message
    const notification = document.createElement('p');
    notification.textContent = "You've been rickrolled! This game is not available yet.";
    notification.className = 'rickroll-message';
    
    // Add some pixel-style decoration
    const pixelDecoration = document.createElement('div');
    pixelDecoration.className = 'pixel-decoration';
    
    // Create pixel elements (emojis that fit the game theme)
    const pixelEmojis = ['🎮', '👾', '🎯', '🎲', '🎪', '🎭'];
    for (let i = 0; i < 10; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'floating-pixel';
        pixel.textContent = pixelEmojis[Math.floor(Math.random() * pixelEmojis.length)];
        pixel.style.left = `${Math.random() * 100}%`;
        pixel.style.top = `${Math.random() * 100}%`;
        pixel.style.animationDelay = `${Math.random() * 5}s`;
        pixelDecoration.appendChild(pixel);
    }
    
    // Assemble and add to document
    videoContainer.appendChild(iframe);
    videoContainer.appendChild(fallbackButton);
    overlay.appendChild(pixelDecoration);
    overlay.appendChild(title);
    overlay.appendChild(videoContainer);
    overlay.appendChild(notification);
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);
    
    // Play a retro sound effect
    playRetroSound();
}

// Play a retro sound effect when rickrolled
function playRetroSound() {
    // Create a simple audio effect using the Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create an oscillator for a retro sound
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square'; // Square wave for 8-bit sound
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            100, audioContext.currentTime + 0.2
        );
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01, audioContext.currentTime + 0.5
        );
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported or blocked:', e);
    }
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
    // Let our main click handler handle the game selection
    gameCards[randomIndex].click();
}
// Game state
const gameState = {
    currentScreen: 'intro',
    selectedMode: null,
    currentQuestion: 0,
    scores: {
        ethics: 0,
        order: 0,
        reality: 0
    },
    decisions: [],
    isMuted: false
};

// Sound Management
const sounds = {
    intro: new Audio('assets/SOUND/INTRO.mp3'),
    background: new Audio('assets/SOUND/BACKGROUND MUSIC.mp3'),
    yes: new Audio('assets/SOUND/YES.mp3'),
    no: new Audio('assets/SOUND/NO.mp3'),
    click: new Audio('assets/SOUND/click.mp3')
};

// Log sound loading status
Object.entries(sounds).forEach(([name, sound]) => {
    sound.addEventListener('canplaythrough', () => {
        console.log(`Sound loaded successfully: ${name}`);
    });
    sound.addEventListener('error', (e) => {
        console.error(`Error loading sound ${name}:`, e);
        console.error('Source:', sound.src);
    });
});

// Configure sounds
sounds.background.loop = true;
sounds.background.volume = 0.3; // Lower volume for background music

// Function to play sound with error handling
function playSound(soundName) {
    if (gameState.isMuted) {
        console.log('Sound muted, not playing:', soundName);
        return;
    }
    
    try {
        const sound = sounds[soundName];
        if (sound) {
            console.log('Attempting to play sound:', soundName);
            sound.currentTime = 0; // Reset to start
            sound.play()
                .then(() => console.log('Sound played successfully:', soundName))
                .catch(e => {
                    console.error('Sound play prevented:', soundName, e);
                    console.error('Sound state:', {
                        muted: sound.muted,
                        volume: sound.volume,
                        paused: sound.paused,
                        src: sound.src,
                        readyState: sound.readyState
                    });
                });
        } else {
            console.error('Sound not found:', soundName);
        }
    } catch (error) {
        console.error('Error playing sound:', soundName, error);
    }
}

// Function to toggle all sounds
function toggleSound() {
    const soundToggle = document.getElementById('sound-toggle');
    const soundOnIcon = soundToggle.querySelector('.sound-on');
    const soundOffIcon = soundToggle.querySelector('.sound-off');
    
    gameState.isMuted = !gameState.isMuted;
    soundToggle.classList.toggle('muted');
    
    if (gameState.isMuted) {
        // Mute all sounds
        Object.values(sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        soundOnIcon.style.display = 'none';
        soundOffIcon.style.display = 'block';
    } else {
        // Unmute and play appropriate sound
        soundOnIcon.style.display = 'block';
        soundOffIcon.style.display = 'none';
        if (gameState.currentScreen === 'intro') {
            playSound('intro');
        } else {
            playSound('background');
        }
    }
}

// Add sound toggle event listener
document.getElementById('sound-toggle').addEventListener('click', () => {
    playSound('click');
    toggleSound();
});

// Load game data
let gameData = null;

async function loadGameData() {
    try {
        const response = await fetch('questions_full.json');
        gameData = await response.json();
        console.log('Game data loaded successfully:', gameData);
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

// DOM Elements
const screens = {
    intro: document.getElementById('intro-screen'),
    mode: document.getElementById('mode-screen'),
    question: document.getElementById('question-screen'),
    result: document.getElementById('result-screen')
};

const startBtn = document.getElementById('start-btn');
const modeCards = document.querySelectorAll('.mode-card');
const questionText = document.querySelector('.question-text');
const yesBtn = document.querySelector('.yes-btn');
const noBtn = document.querySelector('.no-btn');
const progressFill = document.querySelector('.progress-fill');
const retryBtn = document.querySelector('.retry-btn');
const shareBtn = document.querySelector('.share-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Play intro sound when page loads
    playSound('intro');
});

startBtn.addEventListener('click', () => {
    playSound('click');
    showScreen('mode');
    // Start background music when leaving intro screen
    sounds.intro.pause();
    playSound('background');
});

modeCards.forEach(card => {
    card.addEventListener('click', () => {
        playSound('click');
        const mode = card.dataset.mode;
        startGame(mode);
    });
});

yesBtn.addEventListener('click', () => {
    playSound('yes');
    handleAnswer(true);
});

noBtn.addEventListener('click', () => {
    playSound('no');
    handleAnswer(false);
});

retryBtn.addEventListener('click', () => {
    playSound('click');
    resetGame();
});

shareBtn.addEventListener('click', () => {
    playSound('click');
    shareResult();
});

// Screen Management
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
    gameState.currentScreen = screenName;

    if (!gameState.isMuted) {
        // Handle music for result screen
        if (screenName === 'result') {
            sounds.background.volume = 0.1; // Lower volume for results
        } else {
            sounds.background.volume = 0.3; // Normal volume
        }
    }
}

// Game Flow
function startGame(mode) {
    gameState.selectedMode = mode;
    gameState.currentQuestion = 0;
    gameState.scores = { ethics: 0, order: 0, reality: 0 };
    gameState.decisions = [];
    showQuestion();
}

function showQuestion() {
    const questions = getCurrentQuestions();
    const question = questions[gameState.currentQuestion];
    questionText.textContent = question.question;
    updateProgress();
    showScreen('question');
}

function handleAnswer(isYes) {
    const questions = getCurrentQuestions();
    const question = questions[gameState.currentQuestion];
    const impact = isYes ? question.yes : question.no;

    // Update scores
    Object.keys(impact).forEach(key => {
        gameState.scores[key] += impact[key];
    });

    // Record decision
    gameState.decisions.push({
        question: question.question,
        answer: isYes ? 'Yes' : 'No',
        impact: impact
    });

    // Move to next question or show results
    gameState.currentQuestion++;
    console.log('Current question:', gameState.currentQuestion, 'Total questions:', questions.length);
    
    if (gameState.currentQuestion >= questions.length) {
        console.log('Showing result screen');
        showResult();
    } else {
        showQuestion();
    }
}

function updateProgress() {
    const questions = getCurrentQuestions();
    const progress = ((gameState.currentQuestion + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

function getCurrentQuestions() {
    return gameData[gameState.selectedMode];
}

// Result Calculation
function showResult() {
    console.log('Calculating personality...');
    const personality = calculatePersonality();
    console.log('Personality result:', personality);
    updateResultScreen(personality);
    showScreen('result');
}

function calculatePersonality() {
    const scores = gameState.scores;
    console.log('Final scores:', scores);
    
    // Default personality if no match is found
    const defaultPersonality = {
        title: "The Shrug Emoji",
        tagline: "You go with the flow, for better or worse",
        image: "theshrugemoji"
    };

    if (!gameData.personalities) {
        console.log('No personalities found in game data');
        return defaultPersonality;
    }

    let bestMatch = null;
    let bestScore = -Infinity;
    
    console.log('Available personalities:', Object.keys(gameData.personalities));
    console.log('Checking against thresholds...');

    Object.entries(gameData.personalities).forEach(([type, data]) => {
        // Calculate match score based on how close the player's scores are to the thresholds
        const matchScore = Object.entries(data.thresholds).reduce((score, [key, threshold]) => {
            const playerScore = scores[key];
            
            // Calculate how well this score matches the threshold
            let match = 0;
            if (threshold > 0) {
                // For positive thresholds, check if we meet or exceed
                match = playerScore >= threshold ? 1 : -Math.abs(playerScore - threshold);
            } else if (threshold < 0) {
                // For negative thresholds, check if we're below or equal
                match = playerScore <= threshold ? 1 : -Math.abs(playerScore - threshold);
            } else {
                // For zero thresholds, reward being close to zero
                match = 1 - Math.abs(playerScore) / 3;
            }
            
            console.log(`${type} - ${key}: player=${playerScore}, threshold=${threshold}, match=${match}`);
            return score + match;
        }, 0);

        // Add a small bonus for exact matches
        if (Object.entries(data.thresholds).every(([key, threshold]) => {
            return Math.abs(scores[key] - threshold) <= 1;
        })) {
            matchScore += 1;
        }

        console.log(`Total match score for ${type}: ${matchScore}`);

        if (matchScore > bestScore) {
            bestScore = matchScore;
            bestMatch = type;
            console.log(`New best match: ${type} with score ${matchScore}`);
        }
    });

    // Only use Shrug Emoji if no good matches found
    if (bestScore < -5) {
        console.log('No good matches found, defaulting to Shrug Emoji');
        return defaultPersonality;
    }

    console.log('Final best match:', bestMatch, 'with score:', bestScore);
    const result = gameData.personalities[bestMatch];
    console.log('Returning personality:', result);
    return result;
}

function updateResultScreen(personality) {
    document.querySelector('.personality-title').textContent = personality.title;
    document.querySelector('.personality-tagline').textContent = personality.tagline;
    
    // Update personality image
    const imagePath = `assets/image/${personality.image || 'theshrugemoji'}.png`;
    document.querySelector('.personality-image').src = imagePath;

    // Update alignment bars
    Object.entries(gameState.scores).forEach(([key, value]) => {
        const bar = document.querySelector(`.${key} .bar-fill`);
        const percentage = Math.max(0, Math.min(100, (value + 15) * 3.33)); // Scale to 0-100
        bar.style.width = `${percentage}%`;
    });
}

// Reset and Share
function resetGame() {
    if (!gameState.isMuted) {
        sounds.background.pause();
        sounds.background.currentTime = 0;
        playSound('intro');
    }
    showScreen('intro');
}

async function generateResultCard(personality) {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (card dimensions)
    canvas.width = 800;
    canvas.height = 1000;
    
    // Draw background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add gradient border
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#6C63FF');
    gradient.addColorStop(1, '#FF6584');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Load and draw personality image
    try {
        const image = await loadImage(`assets/image/${personality.image || 'theshrugemoji'}.png`);
        // Draw image in a circular frame
        ctx.save();
        ctx.beginPath();
        const centerX = canvas.width / 2;
        const imageSize = 240;
        const imageY = 120;
        ctx.arc(centerX, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(image, centerX - imageSize/2, imageY, imageSize, imageSize);
        ctx.restore();

        // Add circular border
        ctx.strokeStyle = '#6C63FF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(centerX, imageY + imageSize/2, imageSize/2, 0, Math.PI * 2);
        ctx.stroke();
    } catch (error) {
        console.error('Error loading personality image:', error);
    }
    
    // Add title
    ctx.fillStyle = '#6C63FF';
    ctx.font = 'bold 48px "Space Grotesk"';
    ctx.textAlign = 'center';
    ctx.fillText(personality.title.toUpperCase(), canvas.width/2, 420);
    
    // Add tagline with better line wrapping
    ctx.fillStyle = '#2D3436';
    ctx.font = '24px "Space Grotesk"';
    const maxWidth = 600; // Maximum width for text
    const words = personality.tagline.split(' ');
    let line = '';
    let y = 470;
    
    for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
            ctx.fillText(line.trim(), canvas.width/2, y);
            line = word + ' ';
            y += 35;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), canvas.width/2, y);
    
    // Draw alignment bars with better spacing
    const barY = 600;
    const barHeight = 30;
    const barSpacing = 60;
    const barWidth = 400;
    const labelWidth = 80;
    const barStartX = (canvas.width - barWidth) / 2;
    
    Object.entries(gameState.scores).forEach(([key, value], index) => {
        const y = barY + (barSpacing * index);
        
        // Draw label
        ctx.fillStyle = '#2D3436';
        ctx.font = 'bold 24px "Space Grotesk"';
        ctx.textAlign = 'right';
        ctx.fillText(key.toUpperCase(), barStartX - 20, y + barHeight/2 + 8);
        
        // Draw bar background
        ctx.fillStyle = '#E9ECEF';
        ctx.fillRect(barStartX, y, barWidth, barHeight);
        
        // Draw bar fill with gradient
        const percentage = Math.max(0, Math.min(100, (value + 15) * 3.33));
        const fillWidth = (percentage / 100) * barWidth;
        const barGradient = ctx.createLinearGradient(barStartX, y, barStartX + fillWidth, y);
        barGradient.addColorStop(0, '#6C63FF');
        barGradient.addColorStop(1, '#FF6584');
        ctx.fillStyle = barGradient;
        ctx.fillRect(barStartX, y, fillWidth, barHeight);
    });
    
    // Add game title and URL at bottom with better spacing
    const bottomY = canvas.height - 80;
    ctx.fillStyle = '#2D3436';
    ctx.font = 'bold 28px "Space Grotesk"';
    ctx.textAlign = 'center';
    ctx.fillText('WHAT IF...', canvas.width/2, bottomY);
    ctx.font = '20px "Space Grotesk"';
    ctx.fillText('Play now at: gamesnack.fun', canvas.width/2, bottomY + 35);
    
    return canvas.toDataURL('image/jpeg', 0.9);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function shareResult() {
    const personality = calculatePersonality();
    try {
        // Generate result card
        const resultCardDataUrl = await generateResultCard(personality);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `whatif-${personality.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        link.href = resultCardDataUrl;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Play sound
        playSound('click');
        
        // Also try web share if available
        if (navigator.share) {
            try {
                const blob = await (await fetch(resultCardDataUrl)).blob();
                const file = new File([blob], link.download, { type: 'image/jpeg' });
                await navigator.share({
                    title: 'My What If... Result',
                    text: `I got "${personality.title}" in What If...! ${personality.tagline}`,
                    files: [file]
                });
            } catch (shareError) {
                console.log('Share cancelled or failed:', shareError);
            }
        }
    } catch (error) {
        console.error('Error generating or sharing result card:', error);
        alert('Could not generate result card. Please try again.');
    }
}

// Initialize game
loadGameData(); 
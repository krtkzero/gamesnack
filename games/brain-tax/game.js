// Add these new configurations at the top of the file
const DAILY_PUZZLES = {
    mathPuzzles: [
        { 
            type: 'sequence', 
            question: 'Complete the sequence: 2, 4, 8, 16, ?',
            answer: '32',
            options: ['24', '28', '32', '36']
        },
        { 
            type: 'pattern', 
            question: 'If RED = 27, BLUE = 32, what is GREEN?',
            answer: '42',
            options: ['35', '39', '42', '45']
        },
        { 
            type: 'logic', 
            question: 'If all Zorks are Yinks, and no Yinks are blue, can a Zork be blue?',
            answer: 'No',
            options: ['Yes', 'No', 'Maybe', 'Not enough info']
        }
    ],
    memoryPuzzles: [
        { 
            type: 'grid', 
            question: 'Which pattern matches the sequence: ⬜⬛⬜⬛⬜',
            answer: 'Pattern B',
            options: ['Pattern A', 'Pattern B', 'Pattern C', 'Pattern D']
        },
        { 
            type: 'sequence', 
            question: 'What comes next in the sequence: 🎨 🎯 🎲 🎮 ?',
            answer: '🎪',
            options: ['🎪', '🎭', '🎪', '🎨']
        },
        { 
            type: 'words', 
            question: 'Which word doesn\'t belong: CLOUD, RIVER, MOUNTAIN, FOREST?',
            answer: 'CLOUD',
            options: ['CLOUD', 'RIVER', 'MOUNTAIN', 'FOREST']
        }
    ],
    logicPuzzles: [
        { 
            type: 'deduction', 
            question: 'If A > B and B > C, is A always > C?',
            answer: 'Yes',
            options: ['Yes', 'No', 'Maybe', 'Not enough info']
        },
        { 
            type: 'spatial', 
            question: 'Which shape is the rotated version of ⬡?',
            answer: '⬢',
            options: ['⬢', '⬣', '⬤', '⬥']
        },
        { 
            type: 'pattern', 
            question: 'What comes next: 🔵 🔴 🔵 🔴 ?',
            answer: '🔵',
            options: ['🔵', '🔴', '🟡', '🟢']
        }
    ]
};

// Meta viewport tag should be in HTML, not JavaScript
// Removing the incorrectly placed HTML tag and extra closing brace

// Debug task loading function
async function debugLoadTasks() {
    console.log("Debug: Testing task loading");
    try {
        const tasks = await loadTasks();
        console.log("Tasks loaded successfully:", tasks);
        alert(`Successfully loaded ${tasks.length} tasks`);
    } catch (error) {
        console.error("Debug: Error loading tasks:", error);
        alert(`Error loading tasks: ${error.message}`);
    }
}

// Debug function to test task loading
function debugTasksAndDump() {
    console.log("=====================");
    console.log("Current Game State:");
    console.log("Tasks loaded:", gameState.tasks ? gameState.tasks.length : 0);
    console.log("Tasks data:", gameState.tasks);
    console.log("Current task index:", gameState.currentTaskIndex);
    console.log("Selected avatar:", gameState.selectedAvatar);
    console.log("Mental energy:", gameState.mentalEnergy);
    console.log("=====================");
    
    // Try immediate task loading
    loadTasks().then(tasks => {
        console.log("Direct task loading result:", tasks);
        console.log("Loaded tasks count:", tasks.length);
        
        // Check if we can find tasks.json file
        fetch('tasks.json')
            .then(response => {
                console.log("tasks.json fetch response:", response.status, response.ok);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                console.log("tasks.json content length:", text.length);
                try {
                    const parsed = JSON.parse(text);
                    console.log("tasks.json parsed structure:", parsed);
                    
                    if (parsed && parsed.tasks) {
                        console.log("tasks.json contains", parsed.tasks.length, "tasks");
                    } else if (Array.isArray(parsed)) {
                        console.log("tasks.json is an array with", parsed.length, "items");
                    } else {
                        console.log("tasks.json has unexpected structure");
                    }
                } catch (e) {
                    console.error("Error parsing tasks.json:", e);
                }
            })
            .catch(error => {
                console.error("Error fetching tasks.json:", error);
            });
    });
}

// Game state
let gameState = {
    mentalEnergy: 100,
    decisionHistory: [],
    selectedAvatar: null,
    currentMood: 'happy',
    currentTaskIndex: 0,
    tasks: [],
    settings: {
        sound: false // Start with sound off
    }
};

// Sound Effects
const sounds = {
    click: new Audio('sounds/click.mp3'),
    taskComplete: new Audio('sounds/task-complete.mp3'),
    lowEnergy: new Audio('sounds/low-energy.mp3')
};

// Avatar Options with Images
const avatarOptions = [
    { 
        id: 'logical', 
        name: 'Logic Lobe', 
        bonus: 'Better at planning decisions', 
        image: 'assets/images/brain-logical.png',
        color: '#90EE90'  // Light green
    },
    { 
        id: 'creative', 
        name: 'Creative Cortex', 
        bonus: 'Better at social decisions', 
        image: 'assets/images/brain-creative.png',
        color: '#FFB6C1'  // Light pink
    },
    { 
        id: 'balanced', 
        name: 'Balanced Brain', 
        bonus: 'No specific bonus, but more consistent', 
        image: 'assets/images/brain-balanced.png',
        color: '#B19CD9'  // Light purple
    }
];

// Task Categories and Distribution
const taskCategories = {
    micro: { min: 2, max: 3 },
    admin: { min: 1, max: 2 },
    planning: { min: 2, max: 2 },
    social: { min: 2, max: 3 },
    meta: { min: 1, max: 2 }
};

// Load and prioritize tasks
async function loadPrioritizedTasks() {
    try {
        const response = await fetch('tasks.json');
        const data = await response.json();
        
        // Return tasks in their original sequence without randomization
        return data.tasks;
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

// Play sound effects
function playSound(soundType) {
    // Create sound effect library
    const sounds = {
        taskComplete: {
            frequency: 440,
            volume: 0.2,
            duration: 200,
            type: 'sine'
        },
        decision: {
            frequency: 330,
            volume: 0.15,
            duration: 100,
            type: 'sine'
        },
        dayComplete: {
            frequency: [440, 550, 660],
            volume: 0.25,
            duration: [200, 200, 400],
            type: 'triangle'
        },
        menuSelect: {
            frequency: 330,
            volume: 0.15,
            duration: 100,
            type: 'sine'
        },
        gameStart: {
            frequency: [330, 440, 550],
            volume: 0.2,
            duration: [100, 100, 200],
            type: 'sine'
        },
        lowEnergy: {
            frequency: 220,
            volume: 0.2,
            duration: 300,
            type: 'sine'
        },
        taskAppear: {
            frequency: 440,
            volume: 0.2,
            duration: 200,
            type: 'sine'
        },
        select: {
            frequency: 330,
            volume: 0.15,
            duration: 100,
            type: 'sine'
        }
    };
    
    // Get the sound configuration
    const sound = sounds[soundType];
    if (!sound) return;
    
    try {
        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Handle multiple notes (like for completion sounds)
        if (Array.isArray(sound.frequency)) {
            let startTime = audioContext.currentTime;
            
            for (let i = 0; i < sound.frequency.length; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = sound.type;
                oscillator.frequency.value = sound.frequency[i];
                gainNode.gain.value = sound.volume;
                
                oscillator.start(startTime);
                oscillator.stop(startTime + (sound.duration[i] / 1000));
                
                // Fade out
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01, startTime + (sound.duration[i] / 1000)
                );
                
                startTime += (sound.duration[i] / 1000);
            }
        } else {
            // Single note
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = sound.type;
            oscillator.frequency.value = sound.frequency;
            gainNode.gain.value = sound.volume;
            
            oscillator.start();
            
            // Fade out
            gainNode.gain.exponentialRampToValueAtTime(
                0.01, audioContext.currentTime + (sound.duration / 1000)
            );
            
            oscillator.stop(audioContext.currentTime + (sound.duration / 1000));
        }
    } catch (error) {
        console.error("Error playing sound:", error);
    }
}

function toggleSound() {
    gameState.settings.sound = !gameState.settings.sound;
    const soundIcon = document.querySelector('.music-icon');
    if (soundIcon) {
        soundIcon.textContent = gameState.settings.sound ? '🎵' : '🔇';
    }
    
    // Toggle YouTube player if available
    if (player && typeof player.getPlayerState === 'function') {
        if (gameState.settings.sound) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
    }
    
    // Toggle muted class on music toggle button
    const musicToggle = document.getElementById('music-toggle');
    if (musicToggle) {
        if (gameState.settings.sound) {
            musicToggle.classList.remove('muted');
        } else {
            musicToggle.classList.add('muted');
        }
    }
    
    console.log("Sound toggled:", gameState.settings.sound ? "ON" : "OFF");
    playSound('click');
}

// Screen Management
const screens = {};

function showScreen(screenId) {
    // Hide all screens first
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        // Reset scroll position first
        window.scrollTo(0, 0);
        if (targetScreen.scrollTo) {
            targetScreen.scrollTo(0, 0);
        }
        
        targetScreen.classList.add('active');
        
        // Force layout recalculation to ensure proper display
        setTimeout(() => {
            if (targetScreen.scrollTo) {
                targetScreen.scrollTo(0, 0);
            }
            
            // Adjust layout if needed after screen change
            handleResponsiveLayout();
        }, 10);
        
        // Handle specific screen initializations
        if (screenId === 'character-setup') {
            setupCharacterScreen();
            playSound('menuSelect');
        } else if (screenId === 'game-screen') {
            updateTaskProgress();
            playSound('gameStart');
        } else if (screenId === 'summary-screen') {
            // Create a confetti burst for the summary screen
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    spread: 70,
                    origin: { y: 0.3 }
                });
            }, 300);
            
            // Play completion sound
            playSound('dayComplete');
            
            // Make sure play again button has its event listener
            const playAgainBtn = document.getElementById('play-again-btn');
            if (playAgainBtn) {
                // Remove any existing listeners to prevent duplicates
                const newPlayAgainBtn = playAgainBtn.cloneNode(true);
                playAgainBtn.parentNode.replaceChild(newPlayAgainBtn, playAgainBtn);
                
                // Add fresh event listener
                newPlayAgainBtn.addEventListener('click', function() {
                    console.log("Play again button clicked!");
                    playAgain();
                });
            }
        }
        
        console.log(`Showing screen: ${screenId}`);
    } else {
        console.error(`Screen not found: ${screenId}`);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM Content Loaded - Initializing Brain Tax Game");
    
    // Initialize responsive layout
    handleResponsiveLayout();
    
    // Failsafe: Hide loading screen after maximum 5 seconds regardless of initialization
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log("Failsafe: Hiding loading screen after timeout");
            loadingScreen.style.display = 'none';
            
            // Show the character setup screen if no screen is active
            const activeScreen = document.querySelector('.screen.active');
            if (!activeScreen) {
                showScreen('character-setup');
            }
        }
    }, 5000);
    
    // Debug button setup
    const debugBtn = document.getElementById('debug-btn');
    if (debugBtn) {
        debugBtn.addEventListener('click', debugTasksAndDump);
    }
    
    try {
        // Initialize screens
        screens.homeScreen = document.getElementById('home-screen');
        screens.characterSetup = document.getElementById('character-setup');
        screens.gameScreen = document.getElementById('game-screen');
        screens.summaryScreen = document.getElementById('summary-screen');
        
        console.log("Screens initialized:", screens);
        
        // Load YouTube API early
        loadYouTubeAPI();
        
        await initGame();
        
        // Hide loading screen after initialization
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // Show the home screen
        const homeScreen = document.getElementById('home-screen');
        if (homeScreen) {
            console.log("Found home screen, displaying it directly");
            homeScreen.style.display = 'block';
            homeScreen.classList.add('active');
        } else {
            console.error("Home screen not found!");
            showScreen('home-screen');
        }

        // Initialize YouTube player
        setTimeout(initYouTubePlayer, 1000);

        // IMPROVED: Play button handling with multiple approaches for redundancy
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            console.log("Play button found, adding event handler");
            
            // Single reliable click handler
            playBtn.addEventListener('click', function(e) {
                console.log("Play button clicked!");
                e.preventDefault();
                setupCharacterScreen();
                showScreen('character-setup');
            });
            
            // Make button style clearly clickable
            playBtn.style.cursor = 'pointer';
        } else {
            console.error("Play button not found!");
        }

        // Direct start game button handling
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            console.log("Start game button found, adding click handler");
            startGameBtn.addEventListener('click', async function() {
                console.log("Start game button clicked!");
                if (gameState.selectedAvatar) {
                    showScreen('game-screen');
                    
                    // Wait for tasks to load before starting the game
                    await loadTasks();
                    startGame();
                } else {
                    // Alert the user to select an avatar first
                    alert("Please select a brain avatar to continue!");
                }
            });
        } else {
            console.error("Start game button not found!");
        }

        // Play again button handling
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            console.log("Play again button found, adding event handler");
            playAgainBtn.addEventListener('click', function() {
                console.log("Play again button clicked!");
                resetGame();
                showScreen('character-setup');
            });
        } else {
            console.error("Play again button not found!");
        }

        // Setup music toggle separately for reliability
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            console.log("Setting up music toggle directly");
            musicToggle.addEventListener('click', function(e) {
                console.log("Music toggle clicked directly");
                e.preventDefault();
                toggleSound();
            });
            
            // Initialize state
            if (!gameState.settings.sound) {
                musicToggle.classList.add('muted');
                const icon = musicToggle.querySelector('.music-icon');
                if (icon) icon.textContent = '🔇';
            }
        }
    } catch (error) {
        console.error("Error initializing game:", error);
    }
});

// Mental Energy Management
function updateEnergy(change) {
    // Calculate new energy level
    const oldEnergy = gameState.mentalEnergy;
    gameState.mentalEnergy = Math.max(0, Math.min(100, gameState.mentalEnergy + change));
    
    // Get energy bar elements
    const energyFill = document.getElementById('energy-fill');
    const energyText = document.getElementById('energy-text');
    
    if (!energyFill || !energyText) {
        console.error("Energy bar elements not found");
        return;
    }

    // Create visual indicator for energy change
    if (change !== 0) {
        const indicator = document.createElement('div');
        indicator.className = 'energy-cost-indicator';
        indicator.textContent = change > 0 ? `+${change}` : change;
        indicator.style.color = change > 0 ? 'var(--energy-full)' : 'var(--energy-low)';
        
        // Add to the top bar
        const topBar = document.getElementById('top-bar');
        if (topBar) {
            topBar.appendChild(indicator);
            
            // Remove after animation
            setTimeout(() => {
                indicator.classList.add('fadeout');
                setTimeout(() => {
                    indicator.remove();
                }, 500);
            }, 1000);
        }
        
        // Create energy particles
        if (change < 0) {
            createEnergyParticles(Math.abs(change));
        }
        
        // Play sound based on energy change
        if (change < -20) {
            playSound('lowEnergy');
        } else if (change < 0) {
            playSound('decision');
        } else if (change > 0) {
            playSound('taskComplete');
        }
    }
    
    // Animate the energy bar
    updateEnergyBar();
}

// Create visual particles when energy decreases
function createEnergyParticles(amount) {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'energy-particles';
    
    const topBar = document.getElementById('top-bar');
    if (!topBar) return;
    
    topBar.appendChild(particleContainer);
    
    // Create particles based on amount of energy lost
    const particleCount = Math.min(Math.floor(amount / 2), 15); // Cap at 15 particles
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'energy-particle';
        
        // Randomize position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Randomize animation
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        particle.style.animationDuration = `${0.8 + Math.random() * 1}s`;
        
        particleContainer.appendChild(particle);
    }
    
    // Remove particles after animation
    setTimeout(() => {
        particleContainer.remove();
    }, 2000);
}

// Update energy bar appearance
function updateEnergyBar() {
    // Get energy bar elements
    const energyFill = document.getElementById('energy-fill');
    const energyText = document.getElementById('energy-text');
    
    if (!energyFill || !energyText) {
        console.error("Energy bar elements not found");
        return;
    }
    
    // Ensure mental energy is a number between 0 and 100
    const energyValue = Math.max(0, Math.min(100, gameState.mentalEnergy));
    
    // Update width and text
    energyFill.style.width = `${energyValue}%`;
    energyText.textContent = `${Math.round(energyValue)}%`;
    
    // Update color class based on energy level
    energyFill.classList.remove('energy-high', 'energy-medium', 'energy-low');
    
    if (energyValue > 60) {
        energyFill.classList.add('energy-high');
    } else if (energyValue > 30) {
        energyFill.classList.add('energy-medium');
    } else {
        energyFill.classList.add('energy-low');
    }
    
    // Also update mood if available
    updateMood();
}

// Function to handle option selection
function selectOption(optionIndex) {
    console.log(`Option ${optionIndex} selected`);
    
    const currentTask = gameState.tasks[gameState.currentTaskIndex];
    if (!currentTask || !currentTask.options || optionIndex >= currentTask.options.length) {
        console.error("Invalid option selected");
        return;
    }
    
    const selectedOption = currentTask.options[optionIndex];
    console.log("Selected option:", selectedOption);
    
    // Calculate and apply energy cost
    const baseCost = selectedOption.baseCost || 0;
    const energyCost = calculateEnergyCost(baseCost, currentTask.type);
    
    // Add selection to history
    gameState.decisionHistory.push({
        taskTitle: currentTask.title,
        optionText: selectedOption.text || selectedOption.label || `Option ${optionIndex+1}`,
        energyCost: energyCost,
        taskType: currentTask.type
    });
    
    // Update energy
    updateEnergy(-energyCost);
    
    // Apply any side effects
    if (selectedOption.sideEffect) {
        applySideEffect(selectedOption.sideEffect);
    }
    
    // Move to next task
    gameState.currentTaskIndex++;
    
    // Update debug info
    updateDebugInfo();
    
    // Show next task or end day
    showNextTask();
}

// Calculate energy cost based on task type and avatar
function calculateEnergyCost(baseCost, taskType) {
    let cost = baseCost || 0;
    
    // Apply avatar bonuses
    if (gameState.selectedAvatar === 'logical' && taskType === 'planning') {
        cost = Math.max(1, Math.floor(cost * 0.7)); // 30% discount for planning tasks
    } else if (gameState.selectedAvatar === 'creative' && taskType === 'social') {
        cost = Math.max(1, Math.floor(cost * 0.7)); // 30% discount for social tasks
    }
    
    return cost;
}

// Apply side effects from options
function applySideEffect(sideEffect) {
    if (typeof sideEffect === 'string') {
        // Handle string-based side effects
        switch (sideEffect) {
            case 'rush_later':
                console.log("Applied rush_later effect");
                break;
            case 'time_waste':
                console.log("Applied time_waste effect");
                break;
            case 'hunger':
                updateEnergy(-5);
                console.log("Applied hunger effect: -5 energy");
                break;
            case 'guilt':
                console.log("Applied guilt effect");
                break;
            case 'procrastination':
                console.log("Applied procrastination effect");
                break;
            case 'missed_opportunity':
                console.log("Applied missed_opportunity effect");
                break;
            case 'disconnected':
                console.log("Applied disconnected effect");
                break;
            case 'stress':
                updateEnergy(-3);
                console.log("Applied stress effect: -3 energy");
                break;
            case 'burnout':
                updateEnergy(-10);
                console.log("Applied burnout effect: -10 energy");
                break;
            case 'exhaustion':
                updateEnergy(-8);
                console.log("Applied exhaustion effect: -8 energy");
                break;
            case 'distraction':
                console.log("Applied distraction effect");
                break;
            case 'anxiety':
                updateEnergy(-5);
                console.log("Applied anxiety effect: -5 energy");
                break;
            case 'work_life_imbalance':
                updateEnergy(-7);
                console.log("Applied work_life_imbalance effect: -7 energy");
                break;
            case 'interruption':
                console.log("Applied interruption effect");
                break;
            case 'missed_call_anxiety':
                console.log("Applied missed_call_anxiety effect");
                break;
            default:
                console.log(`Unknown side effect: ${sideEffect}`);
        }
    } else if (typeof sideEffect === 'object') {
        // Handle object-based side effects (from fallback tasks)
        if (sideEffect.type === 'energy' && sideEffect.amount) {
            updateEnergy(sideEffect.amount);
            console.log(`Applied energy effect: ${sideEffect.amount > 0 ? '+' : ''}${sideEffect.amount} energy`);
        }
    }
}

// Get task description based on type
function getTaskDescription(taskType) {
    switch (taskType) {
        case 'micro':
            return "How will you handle this small daily task?";
        case 'admin':
            return "How do you handle this administrative task?";
        case 'planning':
            return "What's your approach to this planning situation?";
        case 'social':
            return "How will you navigate this social interaction?";
        case 'meta':
            return "How will you manage your energy right now?";
        case 'crisis':
            return "How will you respond to this unexpected situation?";
        default:
            return "What will you choose?";
    }
}

// Thought Bubble System
async function showThoughtBubble(context) {
    const bubble = document.getElementById('thought-bubble');
    let thought = '';

    try {
        const response = await fetch('thoughts.json');
        const thoughts = await response.json();
        
        if (context.type === 'mental_state_change') {
            const state = context.state;
            const prefix = context.isPositive ? "Power Up! " : "Power Down! ";
            thought = prefix + (thoughts.mental_state_changes[state] || `You're feeling ${state.toLowerCase()}!`);
        } else if (context.type === 'puzzle_result') {
            thought = context.isCorrect ? 
                thoughts.puzzle_success[Math.floor(Math.random() * thoughts.puzzle_success.length)] :
                thoughts.puzzle_failure[Math.floor(Math.random() * thoughts.puzzle_failure.length)];
        } else if (context.type === 'energy_level') {
            const level = context.level > 60 ? 'high' : context.level > 30 ? 'medium' : 'low';
            thought = thoughts.energy_levels[level][Math.floor(Math.random() * thoughts.energy_levels[level].length)];
        } else if (context.taskType) {
            thought = thoughts.task_types[context.taskType][Math.floor(Math.random() * thoughts.task_types[context.taskType].length)];
        }
    } catch (error) {
        console.error('Error loading thoughts:', error);
        thought = 'Hmm...';
    }

    // Set text and show bubble
    bubble.textContent = thought;
    bubble.classList.add('visible');
    
    // Hide bubble after delay
    setTimeout(() => {
        bubble.classList.remove('visible');
    }, 3000);
}

// Set up avatar selection
function setupAvatarSelection() {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const startGameBtn = document.getElementById('start-game-btn');
    
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Store the selected avatar
            gameState.selectedAvatar = option.dataset.avatar;
            
            // Enable start game button
            if (startGameBtn) {
                startGameBtn.classList.add('ready');
            }
        });
    });
}

// Character Setup - Fixed version
function setupCharacterScreen() {
    console.log("Setting up character screen");
    
    // Reset selected avatar
    gameState.selectedAvatar = null;
    
    // Remove selected class from all avatar options
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Reset start button
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.classList.remove('ready');
    }
    
    // Setup avatar selection event listeners
    setupAvatarSelection();
}

// Task Management
function updateTaskProgress() {
    const progress = document.getElementById('task-progress');
    if (progress) {
        progress.textContent = `Task ${gameState.currentTaskIndex + 1} of ${gameState.tasks.length}`;
    }
}

// Initialize the game
async function initGame() {
    console.log("Initializing game...");

    // Reset game state
    gameState = {
        mentalEnergy: 100,
        selectedAvatar: null,
        currentTaskIndex: 0,
        tasks: [],
        decisionHistory: []
    };
    
    // Load tasks
    try {
        gameState.tasks = await loadTasks();
        console.log("Loaded tasks:", gameState.tasks);
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
    
    // Initialize UI elements and event listeners
    setupGameButtons();
    setupAvatarSelection();
    
    // Initialize music and sounds (muted by default)
    setupAudio();
    
    // Setup animation
    setupBrainAnimation();
    
    // Show home screen
    showScreen('home-screen');
    
    // Hide loading indicator
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Set up game buttons
function setupGameButtons() {
    // Home screen button
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            showScreen('character-setup');
            setupCharacterScreen();
        });
    }
    
    // Set up the start game button
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', async () => {
            console.log("Start game button clicked");
            // First, validate avatar selection
            if (!gameState.selectedAvatar) {
                console.warn("No avatar selected");
                alert("Please select an avatar before starting");
                return;
            }
            
            showScreen('game-screen');
            await startGame();
        });
    }
    
    // Summary screen - Play again button
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            initGame();
        });
    }
    
    // Set up debug panel buttons
    const debugBtn = document.getElementById('debug-btn');
    if (debugBtn) {
        debugBtn.addEventListener('click', () => {
            const debugPanel = document.getElementById('debug-panel');
            if (debugPanel) {
                debugPanel.classList.toggle('visible');
            }
        });
    }
    
    const reloadTasksBtn = document.getElementById('reload-tasks-btn');
    if (reloadTasksBtn) {
        reloadTasksBtn.addEventListener('click', async () => {
            try {
                showLoadingIndicator(true);
                const tasks = await loadTasks();
                gameState.tasks = tasks;
                showLoadingIndicator(false);
                alert(`Successfully reloaded ${tasks.length} tasks`);
                console.log("Reloaded tasks:", tasks);
            } catch (error) {
                showLoadingIndicator(false);
                alert(`Error reloading tasks: ${error.message}`);
            }
        });
    }
}

// Start the game
async function startGame() {
    console.log("Starting new game...");
    // Reset game state
    showLoadingIndicator(true);
    
    try {
        await setupGame();
        
        showScreen('game-screen');
    updateEnergyBar();
        showNextTask();
        updateAvatarDisplay();
    } catch (error) {
        console.error("Error starting game:", error);
        showErrorScreen("Failed to start game. Please try again.");
    } finally {
        showLoadingIndicator(false);
    }
}

// Load tasks from tasks.json
async function loadTasks() {
    try {
        const response = await fetch('tasks.json');
        if (!response.ok) {
            throw new Error('Failed to load tasks.json');
        }
        
        const data = await response.json();
        
        if (data && data.tasks && Array.isArray(data.tasks)) {
            console.log(`Successfully loaded ${data.tasks.length} tasks from tasks.json`);
            return data.tasks;
        } else if (Array.isArray(data)) {
            console.log(`Successfully loaded ${data.length} tasks from tasks.json (array format)`);
            return data;
        } else {
            console.error("Unexpected data structure in tasks.json");
            throw new Error('Invalid tasks data structure');
        }
    } catch (error) {
        console.error("Error loading tasks:", error);
        alert("Error: Could not load tasks. Please refresh the page and try again.");
        throw error;
    }
}

// Fallback tasks if JSON loading fails
function loadFallbackTasks() {
    return [
        {
            title: "Wake Up Routine",
            type: "micro",
            options: [
                {
                    text: "Snooze alarm",
                    baseCost: 5,
                    image: "assets/images/snoozealarm-wakeuproutine.png",
                    sideEffect: { type: "energy", amount: -2 }
                },
                {
                    text: "Get up immediately",
                    baseCost: 15,
                    image: "assets/images/getupimmediately-wakeuproutine.png"
                },
                {
                    text: "Check phone in bed",
                    baseCost: 8,
                    image: "assets/images/checkphoneinbed-wakeuproutine.png"
                },
                {
                    text: "Morning stretch",
                    baseCost: 10,
                    image: "assets/images/morningstretch-wakeuproutine.png",
                    sideEffect: { type: "energy", amount: 5 }
                }
            ]
        },
        {
            title: "Breakfast Decision",
            type: "micro",
            options: [
                {
                    text: "Quick cereal",
                    baseCost: 3,
                    image: "assets/images/quickcereal-breakfastdecision.png"
                },
                {
                    text: "Skip breakfast",
                    baseCost: 0,
                    image: "assets/images/skipbreakfast-breakfastdecision.png",
                    sideEffect: { type: "energy", amount: -5 }
                },
                {
                    text: "Coffee only",
                    baseCost: 2,
                    image: "assets/images/coffeeonly-breakfastdecision.png",
                    sideEffect: { type: "energy", amount: 3 }
                },
                {
                    text: "Cook healthy meal",
                    baseCost: 12,
                    image: "assets/images/cookbreakfast-breakfastdecision.png",
                    sideEffect: { type: "energy", amount: 8 }
                }
            ]
        },
        {
            title: "Afternoon Slump",
            type: "meta",
            options: [
                {
                    text: "Coffee break",
                    baseCost: 8,
                    image: "assets/images/coffeebreak-afternoonslump.png",
                    sideEffect: { type: "energy", amount: 10 }
                },
                {
                    text: "Power through",
                    baseCost: 15,
                    image: "assets/images/powerthrough-afternoonslump.png"
                },
                {
                    text: "Quick walk",
                    baseCost: 12,
                    image: "assets/images/quickwalk-afternoonslump.png",
                    sideEffect: { type: "energy", amount: 8 }
                },
                {
                    text: "Snack break",
                    baseCost: 5,
                    image: "assets/images/snackbreak-afternoonslump.png",
                    sideEffect: { type: "energy", amount: 5 }
                }
            ]
        }
    ];
}

// Function to show the next task
function showNextTask() {
    const taskIndex = gameState.currentTaskIndex;
    if (taskIndex >= gameState.tasks.length) {
        endDay();
        return;
    }
    
    const currentTask = gameState.tasks[taskIndex];
    console.log("Showing task:", currentTask.title);
    console.log("Task options:", currentTask.options);
    
    // Clear previous task options
    const optionsContainer = document.querySelector('.options-container');
    if (!optionsContainer) {
        console.error("Options container not found");
        return;
    }
    optionsContainer.innerHTML = '';
    
    // Update task title and description
    const taskTitle = document.querySelector('.task-title');
    const taskDescription = document.querySelector('.task-description');
    
    if (taskTitle && taskDescription) {
        taskTitle.textContent = currentTask.title;
        taskDescription.textContent = getTaskDescription(currentTask.type);
    } else {
        console.error("Task title or description elements not found");
    }
    
    // Update progress indicator
    const progressEl = document.getElementById('task-progress');
    if (progressEl) {
        progressEl.textContent = `Task ${taskIndex + 1} of ${gameState.tasks.length}`;
    }
    
    // Create options grid
    const options = currentTask.options || [];
    
    // Make sure we always have a 2x2 grid, even if there are fewer options
    const gridSize = 4;
    const visibleOptions = options.length;
    
    for (let i = 0; i < gridSize; i++) {
        // If this position has a real option
        if (i < visibleOptions) {
            const option = options[i];
            
            // Get the option text - never use placeholder "Option" text
            const optionText = option.text || option.label || '';
            console.log(`Creating option ${i+1}:`, optionText);
            
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.dataset.optionIndex = i;
            
            // Create the image container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'option-img';
            
            const img = document.createElement('img');
            img.src = option.image || 'assets/images/default-option.png';
            img.alt = optionText;
            imgContainer.appendChild(img);
            
            // Create label container and add the text
            const textContainer = document.createElement('div');
            textContainer.className = 'option-content';
            
            const label = document.createElement('div');
            label.className = 'option-label';
            label.textContent = optionText;
            console.log(`Set option ${i+1} text to:`, label.textContent);
            
            textContainer.appendChild(label);
            
            // Add the image and text to the button
            optionBtn.appendChild(imgContainer);
            optionBtn.appendChild(textContainer);
            
            // Add click handler
            optionBtn.addEventListener('click', function() {
                selectOption(i);
            });
            
            // Add button to the grid
            optionsContainer.appendChild(optionBtn);
        } else {
            // Create empty option slot to maintain 2x2 grid
            const emptySlot = document.createElement('div');
            emptySlot.className = 'option-btn hidden';
            emptySlot.style.visibility = 'hidden';
            optionsContainer.appendChild(emptySlot);
        }
    }
    
    // Debug: Check what was rendered
    console.log("Options container after rendering:", optionsContainer.innerHTML);
    
    // Update debug info
    updateDebugInfo();
    
    // Play task appearance sound
    playSound('taskAppear');
}

// Update avatar display
function updateAvatarDisplay() {
    console.log(`Updating avatar display for: ${gameState.selectedAvatar}`);
    
    const currentAvatar = document.getElementById('current-avatar');
    const currentMood = document.getElementById('current-mood');
    
    if (currentAvatar && currentMood) {
        // Set avatar image based on selected avatar
        switch (gameState.selectedAvatar) {
            case 'logical':
                currentAvatar.innerHTML = '<img src="assets/images/brain-logical.png" alt="Logical Brain">';
                break;
            case 'creative':
                currentAvatar.innerHTML = '<img src="assets/images/brain-creative.png" alt="Creative Brain">';
                break;
            case 'balanced':
                currentAvatar.innerHTML = '<img src="assets/images/brain-balanced.png" alt="Balanced Brain">';
                break;
            default:
                currentAvatar.textContent = '🤔';
        }
        
        // Set mood emoji
        currentMood.textContent = getMoodEmoji();
    }
}

// Get mood emoji based on energy level
function getMoodEmoji() {
    if (gameState.mentalEnergy > 66) return '😊';
    if (gameState.mentalEnergy > 33) return '😐';
    return '😫';
}

// Update mood
function updateMood() {
    if (gameState.mentalEnergy > 66) {
        gameState.currentMood = 'happy';
    } else if (gameState.mentalEnergy > 33) {
        gameState.currentMood = 'neutral';
    } else {
        gameState.currentMood = 'tired';
    }
    updateAvatarDisplay();
}

// End the day and show summary
function endDay() {
    console.log("Day complete! Showing summary screen");
    
    // Calculate score based on remaining energy and decisions made
    const energyScore = gameState.mentalEnergy;
    const decisionsScore = gameState.currentTaskIndex * 10;
    const totalScore = energyScore + decisionsScore;
    
    // Find the most taxing decision
    let mostTaxingTask = { energyCost: 0 };
    if (gameState.decisionHistory.length > 0) {
        mostTaxingTask = gameState.decisionHistory.reduce((prev, current) => 
            (prev.energyCost > current.energyCost) ? prev : current
        );
    }
    
    // Get a self-care tip based on remaining energy
    let selfCareTip = "";
    if (gameState.mentalEnergy < 30) {
        selfCareTip = "Your mental energy is critically low! Try scheduling regular breaks throughout your day.";
    } else if (gameState.mentalEnergy < 60) {
        selfCareTip = "Your mental energy could use a boost! Remember to take quick walks between tough decisions.";
    } else {
        selfCareTip = "Great job maintaining your mental energy! Keep up your balanced approach to decision making.";
    }
    
    // Update UI
    const finalScoreElement = document.getElementById('final-score');
    if (finalScoreElement) {
        finalScoreElement.innerHTML = `
            <div class="summary-badge">🏅</div>
            <h3><span class="score-icon">⭐</span>Final Score</h3>
            <p>Energy Remaining: <strong>${gameState.mentalEnergy}%</strong></p>
            <p>Decisions Made: <strong>${gameState.currentTaskIndex}/${gameState.tasks.length}</strong></p>
            <p>Total Points: <strong>${totalScore}</strong></p>
        `;
    }
    
    const taxingChoiceElement = document.getElementById('taxing-choice');
    if (taxingChoiceElement && mostTaxingTask.task) {
        taxingChoiceElement.innerHTML = `
            <div class="summary-badge">💭</div>
            <h3><span class="score-icon">🧩</span>Most Taxing Decision</h3>
            <p>"${mostTaxingTask.option}" during ${mostTaxingTask.task} cost you ${mostTaxingTask.energyCost} Mental Energy</p>
            <p>Consider how this affected your day's outcome!</p>
        `;
    }
    
    const selfCareTipElement = document.getElementById('self-care-tip');
    if (selfCareTipElement) {
        selfCareTipElement.innerHTML = `
            <div class="summary-badge">💡</div>
            <h3><span class="score-icon">🧘</span>Self Care Tip</h3>
            <p>${selfCareTip}</p>
        `;
    }
    
    // Play success sound
    playSound('dayComplete');
    
    // Show confetti for a good score
    if (totalScore > 70) {
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#F1C76A', '#D3774C', '#A7B96F']
            });
        }, 500);
    }
    
    showScreen('summary-screen');
}

// Reset game
function resetGame() {
    console.log("Resetting game state");
    
    gameState = {
        mentalEnergy: 100,
        decisionHistory: [],
        selectedAvatar: null,
        currentMood: 'happy',
        currentTaskIndex: 0,
        tasks: [],
        settings: {
            sound: false // Start with sound off
        }
    };
}

// YouTube Player - Enhanced implementation
let player = null;
let youtubeAPIReady = false;

// Load YouTube API if not already loaded
function loadYouTubeAPI() {
    if (window.YT || document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        console.log("YouTube API already loading or loaded");
        return;
    }
    
    console.log("Loading YouTube API");
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Called automatically by YouTube API when ready
function onYouTubeIframeAPIReady() {
    console.log("YouTube API is ready");
    youtubeAPIReady = true;
    initYouTubePlayer();
}

function initYouTubePlayer() {
    if (!youtubeAPIReady && window.YT && window.YT.Player) {
        youtubeAPIReady = true;
    }
    
    if (!youtubeAPIReady) {
        console.log("YouTube API not ready yet, will retry");
        loadYouTubeAPI();
        setTimeout(initYouTubePlayer, 1000);
        return;
    }
    
    if (player) {
        console.log("Player already initialized");
        return;
    }
    
    console.log("Initializing YouTube player");
    try {
        player = new YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: 'jfKfPfyJRdk', // Lo-fi hip hop radio
            playerVars: {
                'autoplay': 0, // Start paused
                'controls': 0,
                'disablekb': 1,
                'enablejsapi': 1,
                'fs': 0,
                'iv_load_policy': 3,
                'modestbranding': 1,
                'playsinline': 1,
                'rel': 0,
                'showinfo': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    } catch (e) {
        console.error("Error initializing YouTube player:", e);
    }
}

function onPlayerReady(event) {
    console.log("Player is ready");
    
    // Set volume to 60%
    if (event.target && typeof event.target.setVolume === 'function') {
        event.target.setVolume(60);
    }
    
    // Check if sound should be playing based on gameState
    if (gameState.settings && gameState.settings.sound) {
        console.log("Auto-playing music based on settings");
        event.target.playVideo();
        
        // Make sure UI reflects this
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.classList.remove('muted');
            const icon = musicToggle.querySelector('.music-icon');
            if (icon) icon.textContent = '🎵';
        }
    } else {
        console.log("Music remains paused based on settings");
    }
}

function onPlayerStateChange(event) {
    // Handle state changes
    if (event.data === YT.PlayerState.ENDED) {
        console.log("Video ended, replaying");
        event.target.playVideo(); // Loop the video
    } else if (event.data === YT.PlayerState.PLAYING) {
        console.log("Video now playing");
    } else if (event.data === YT.PlayerState.PAUSED) {
        console.log("Video paused");
    }
}

function onPlayerError(event) {
    console.error("YouTube player error:", event.data);
    
    // Try to recover by reinitializing with a different video
    if (player && event.data === 150 || event.data === 101) {
        console.log("Trying alternate music stream due to error");
        try {
            player.loadVideoById('5qap5aO4i9A'); // Alternate lo-fi stream
        } catch (e) {
            console.error("Failed to load alternate stream:", e);
        }
    }
}

// Music Toggle - Fixed implementation
document.addEventListener('DOMContentLoaded', function() {
    const musicToggle = document.querySelector('.music-toggle');
    let isMusicMuted = true; // Start muted
    
    if (musicToggle) {
        console.log("Music toggle found");
        
        // Initialize proper state
        musicToggle.classList.add('muted');
        musicToggle.querySelector('.music-icon').textContent = '🔇';
        
        // Add click event
        musicToggle.onclick = function() {
            console.log("Music toggle clicked");
            isMusicMuted = !isMusicMuted;
            musicToggle.classList.toggle('muted');
            
            if (isMusicMuted) {
                if (player && typeof player.pauseVideo === 'function') {
                    player.pauseVideo();
                    console.log("Video paused");
                }
                musicToggle.querySelector('.music-icon').textContent = '🔇';
            } else {
                if (player && typeof player.playVideo === 'function') {
                    player.playVideo();
                    console.log("Video playing");
                } else {
                    console.log("Player not ready yet");
                    // Load YouTube if not already loaded
                    if (!window.YT) {
                        // Create YouTube script tag
                        const tag = document.createElement('script');
                        tag.src = "https://www.youtube.com/iframe_api";
                        const firstScriptTag = document.getElementsByTagName('script')[0];
                        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    }
                }
                musicToggle.querySelector('.music-icon').textContent = '🎵';
            }
        };
    } else {
        console.error("Music toggle not found");
    }
});

// Set up new game session
async function setupGame() {
    console.log("Setting up new game...");
    gameState = {
        mentalEnergy: 100,
        decisionHistory: [],
        selectedAvatar: gameState.selectedAvatar || avatarOptions[0].id,
        currentTaskIndex: 0,
        tasks: [],
        settings: gameState.settings || { sound: false }
    };
    
    try {
        // Load tasks
        const allTasks = await loadTasks();
        
        if (!allTasks || allTasks.length === 0) {
            throw new Error("No tasks available");
        }
        
        // Use tasks directly from tasks.json without modifications
        gameState.tasks = allTasks;
        console.log(`Game setup complete with ${gameState.tasks.length} tasks`);
        updateDebugInfo();
    } catch (error) {
        console.error("Error setting up game:", error);
        showErrorScreen("Failed to load tasks. Please refresh and try again.");
    }
}

// Update debug info
function updateDebugInfo() {
    console.log("Current Game State:");
    console.log("Tasks loaded:", gameState.tasks ? gameState.tasks.length : 0);
    console.log("Tasks data:", gameState.tasks);
    console.log("Current task index:", gameState.currentTaskIndex);
    console.log("Selected avatar:", gameState.selectedAvatar);
    console.log("Mental energy:", gameState.mentalEnergy);
}

// Show error screen
function showErrorScreen(message) {
    console.error(message);
    alert(message);
}

// Show loading indicator
function showLoadingIndicator(isLoading) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = isLoading ? 'block' : 'none';
    }
}

// Reset game and play again
function playAgain() {
    console.log("Play again function called");
    resetGame();
    showScreen('character-setup');
}

// Handle responsive scaling
function handleResponsiveLayout() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const aspectRatio = 0.75; // 3:4 ratio (width/height)
    
    // Apply direct styles based on orientation
    if (windowWidth / windowHeight > aspectRatio) {
        // Landscape mode - constrain by height
        const containerHeight = windowHeight;
        const containerWidth = containerHeight * aspectRatio;
        
        gameContainer.style.width = `${containerWidth}px`;
        gameContainer.style.height = `${containerHeight}px`;
    } else {
        // Portrait mode - constrain by width
        const containerWidth = windowWidth;
        const containerHeight = containerWidth / aspectRatio;
        
        gameContainer.style.width = `${containerWidth}px`;
        gameContainer.style.height = `${containerHeight}px`;
    }
    
    // Force redraw on Safari/iOS
    gameContainer.style.display = 'none';
    void gameContainer.offsetHeight; // trigger reflow
    gameContainer.style.display = 'flex';
    
    console.log(`Game container size: ${gameContainer.offsetWidth}x${gameContainer.offsetHeight}`);
    
    // Make sure content is visible
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        if (screen.classList.contains('active')) {
            screen.scrollTop = 0;
        }
    });
}

// Reset scroll position for all screens
function resetScrollPosition() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        if (screen.scrollTo) {
            screen.scrollTo(0, 0);
        }
    });
}

// Fix for iOS Safari issues with 100vh
function fixIOSViewportHeight() {
    // First, get the viewport height
    let vh = window.innerHeight * 0.01;
    // Then set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Use actual full height in iOS Safari
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        document.body.style.height = `${window.innerHeight}px`;
        document.getElementById('game-container').style.height = `${window.innerHeight}px`;
    }
}

// Add event listeners for viewport changes
window.addEventListener('resize', function() {
    fixIOSViewportHeight();
    handleResponsiveLayout();
    resetScrollPosition();
});

window.addEventListener('orientationchange', function() {
    // Short timeout to allow orientation to complete
    setTimeout(function() {
        fixIOSViewportHeight();
        handleResponsiveLayout();
        resetScrollPosition();
    }, 200);
});

// Call these functions on load
document.addEventListener('DOMContentLoaded', function() {
    fixIOSViewportHeight();
    handleResponsiveLayout();
});
// Slice It Clean - Game Logic

document.addEventListener('DOMContentLoaded', () => {
    // Game canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match CSS size
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    
    // Call resize on load and window resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Game variables
    let score = 0;
    let gameActive = false;
    let gameTime = 60; // Game duration in seconds
    let timeRemaining = gameTime;
    let gameTimer;
    let objects = [];
    let slices = [];
    let lastFrameTime = 0;
    let gameMode = 1; // Default to mode 1 (flying objects)
    let particles = []; // For visual effects
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const mode1Button = document.getElementById('mode1Button');
    const mode2Button = document.getElementById('mode2Button');
    const gameInstructions = document.getElementById('gameInstructions');
    
    // Object types with properties
    const objectTypes = [
        { name: 'circle', radius: 30, color: '#ff3c6d', points: 10, speed: 300, secondaryColor: '#d81b4d' },
        { name: 'square', size: 50, color: '#ffcc00', points: 15, speed: 250, secondaryColor: '#d9a700' },
        { name: 'triangle', size: 50, color: '#4deeea', points: 20, speed: 350, secondaryColor: '#25c6c2' },
        { name: 'star', size: 40, color: '#74ee15', points: 25, speed: 400, secondaryColor: '#4eb80e' },
        { name: 'hexagon', size: 45, color: '#a177ff', points: 30, speed: 320, secondaryColor: '#7d4ddb' }
    ];
    
    // Mode 2 stationary objects
    const stationaryObjects = [
        { name: 'rectangle', width: 120, height: 60, color: '#ff3c6d', secondaryColor: '#d81b4d', maxPoints: 50 },
        { name: 'circle', radius: 50, color: '#ffcc00', secondaryColor: '#d9a700', maxPoints: 40 },
        { name: 'triangle', size: 100, color: '#4deeea', secondaryColor: '#25c6c2', maxPoints: 60 },
        { name: 'hexagon', size: 70, color: '#a177ff', secondaryColor: '#7d4ddb', maxPoints: 70 }
    ];
    
    // Mouse/touch tracking variables
    let isMouseDown = false;
    let lastMousePos = { x: 0, y: 0 };
    let currentMousePos = { x: 0, y: 0 };
    
    // Event listeners for mouse/touch
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Button event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    mode1Button.addEventListener('click', () => setGameMode(1));
    mode2Button.addEventListener('click', () => setGameMode(2));
    
    // Set game mode
    function setGameMode(mode) {
        gameMode = mode;
        
        // Update UI
        if (mode === 1) {
            mode1Button.classList.add('active');
            mode2Button.classList.remove('active');
            gameInstructions.innerHTML = '<p>Swipe or drag your mouse to slice the flying objects!</p><p>Cut as many objects as you can before time runs out.</p>';
        } else {
            mode1Button.classList.remove('active');
            mode2Button.classList.add('active');
            gameInstructions.innerHTML = '<p>Cut the shaking objects into equal halves for maximum points!</p><p>The more precise your cut, the higher your score.</p>';
        }
    }
    
    // Mouse/touch event handlers
    function handleMouseDown(e) {
        if (!gameActive) return;
        
        isMouseDown = true;
        const rect = canvas.getBoundingClientRect();
        lastMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        currentMousePos = { ...lastMousePos };
    }
    
    function handleMouseMove(e) {
        if (!gameActive || !isMouseDown) return;
        
        const rect = canvas.getBoundingClientRect();
        currentMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        // Create a slice effect
        createSlice();
        
        // Check for collisions with objects
        checkSliceCollisions();
        
        // Update last position
        lastMousePos = { ...currentMousePos };
    }
    
    function handleMouseUp() {
        isMouseDown = false;
    }
    
    // Touch event handlers (convert touch to mouse events)
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup');
        canvas.dispatchEvent(mouseEvent);
    }
    
    // Create a slice effect
    function createSlice() {
        // Calculate angle and length of slice
        const dx = currentMousePos.x - lastMousePos.x;
        const dy = currentMousePos.y - lastMousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only create slice if movement is significant
        if (distance < 10) return;
        
        const angle = Math.atan2(dy, dx);
        
        // Create slice object
        const slice = {
            x: lastMousePos.x,
            y: lastMousePos.y,
            length: distance,
            angle: angle,
            timeLeft: 0.2 // Slice visible time in seconds
        };
        
        slices.push(slice);
    }
    
    // Check if slice collides with any objects
    function checkSliceCollisions() {
        // Line segment from last position to current position
        const lineStart = lastMousePos;
        const lineEnd = currentMousePos;
        
        // Check each object for collision
        objects.forEach((obj, index) => {
            if (obj.sliced) return; // Skip already sliced objects
            
            let collision = false;
            let slicePosition = 0.5; // Default to middle (perfect cut)
            
            if (obj.mode === 1) {
                // Mode 1: Flying objects
                // Different collision detection based on shape
                switch (obj.type.name) {
                    case 'circle':
                        collision = lineCircleIntersection(
                            lineStart, lineEnd,
                            { x: obj.x, y: obj.y, radius: obj.type.radius }
                        );
                        break;
                        
                    case 'square':
                    case 'triangle':
                    case 'star':
                    case 'hexagon':
                        // For simplicity, use a circular collision for all other shapes
                        collision = lineCircleIntersection(
                            lineStart, lineEnd,
                            { x: obj.x, y: obj.y, radius: obj.type.size / 2 }
                        );
                        break;
                }
                
                if (collision) {
                    // Mark object as sliced
                    obj.sliced = true;
                    obj.sliceAngle = Math.atan2(
                        currentMousePos.y - lastMousePos.y,
                        currentMousePos.x - lastMousePos.x
                    );
                    
                    // Add points
                    score += obj.type.points;
                    scoreElement.textContent = score;
                    
                    // Create particles for visual effect
                    createSliceParticles(obj);
                    
                    // Create two halves of the object (visual effect)
                    obj.sliceTime = 0;
                }
            } else if (obj.mode === 2) {
                // Mode 2: Precision cutting
                // Calculate where the slice intersects the object
                switch (obj.type.name) {
                    case 'rectangle':
                        // Check if line intersects rectangle
                        if (lineRectangleIntersection(
                            lineStart, lineEnd,
                            { x: obj.x - obj.type.width/2, y: obj.y - obj.type.height/2, width: obj.type.width, height: obj.type.height }
                        )) {
                            collision = true;
                            // Calculate slice position (0-1) where 0.5 is perfect middle
                            const dx = lineEnd.x - lineStart.x;
                            const dy = lineEnd.y - lineStart.y;
                            const lineLength = Math.sqrt(dx * dx + dy * dy);
                            
                            if (Math.abs(dx) > Math.abs(dy)) {
                                // Horizontal-ish slice
                                const t = (obj.y - lineStart.y) / dy;
                                const intersectX = lineStart.x + t * dx;
                                slicePosition = (intersectX - (obj.x - obj.type.width/2)) / obj.type.width;
                            } else {
                                // Vertical-ish slice
                                const t = (obj.x - lineStart.x) / dx;
                                const intersectY = lineStart.y + t * dy;
                                slicePosition = (intersectY - (obj.y - obj.type.height/2)) / obj.type.height;
                            }
                        }
                        break;
                        
                    case 'circle':
                        if (lineCircleIntersection(
                            lineStart, lineEnd,
                            { x: obj.x, y: obj.y, radius: obj.type.radius }
                        )) {
                            collision = true;
                            // Calculate slice position based on angle
                            const sliceAngle = Math.atan2(
                                currentMousePos.y - lastMousePos.y,
                                currentMousePos.x - lastMousePos.x
                            );
                            // Normalize angle to 0-1 range
                            slicePosition = ((sliceAngle + Math.PI) / (2 * Math.PI));
                        }
                        break;
                        
                    default:
                        // For other shapes, use circular collision
                        if (lineCircleIntersection(
                            lineStart, lineEnd,
                            { x: obj.x, y: obj.y, radius: obj.type.size / 2 }
                        )) {
                            collision = true;
                            // Calculate slice position based on distance from center
                            const midX = (lineStart.x + lineEnd.x) / 2;
                            const midY = (lineStart.y + lineEnd.y) / 2;
                            const distFromCenter = Math.sqrt((midX - obj.x) * (midX - obj.x) + (midY - obj.y) * (midY - obj.y));
                            slicePosition = distFromCenter / (obj.type.size / 2);
                            // Normalize to 0-1 range where 0.5 is perfect
                            slicePosition = Math.abs(slicePosition - 0.5) * 2;
                        }
                        break;
                }
                
                if (collision) {
                    // Mark object as sliced
                    obj.sliced = true;
                    obj.sliceAngle = Math.atan2(
                        currentMousePos.y - lastMousePos.y,
                        currentMousePos.x - lastMousePos.x
                    );
                    obj.slicePosition = Math.max(0, Math.min(1, slicePosition));
                    
                    // Calculate points based on precision (closer to 0.5 is better)
                    const precision = 1 - Math.abs(obj.slicePosition - 0.5) * 2; // 1 for perfect, 0 for worst
                    const pointsEarned = Math.round(obj.type.maxPoints * precision);
                    
                    // Add points
                    score += pointsEarned;
                    scoreElement.textContent = score;
                    
                    // Create particles for visual effect
                    createSliceParticles(obj);
                    
                    // Create two halves of the object (visual effect)
                    obj.sliceTime = 0;
                    
                    // Schedule next object after a delay
                    setTimeout(spawnObject, 1500);
                }
            }
        });
    }
    
    // Line-circle intersection detection
    function lineCircleIntersection(lineStart, lineEnd, circle) {
        // Vector from line start to circle center
        const dx = circle.x - lineStart.x;
        const dy = circle.y - lineStart.y;
        
        // Vector from line start to line end
        const lineVecX = lineEnd.x - lineStart.x;
        const lineVecY = lineEnd.y - lineStart.y;
        
        // Length of line
        const lineLength = Math.sqrt(lineVecX * lineVecX + lineVecY * lineVecY);
        
        // Unit vector of line
        const lineUnitVecX = lineVecX / lineLength;
        const lineUnitVecY = lineVecY / lineLength;
        
        // Project circle center onto line
        const projection = dx * lineUnitVecX + dy * lineUnitVecY;
        
        // Find closest point on line to circle center
        let closestX, closestY;
        
        // Check if projection is outside line segment
        if (projection < 0) {
            closestX = lineStart.x;
            closestY = lineStart.y;
        } else if (projection > lineLength) {
            closestX = lineEnd.x;
            closestY = lineEnd.y;
        } else {
            closestX = lineStart.x + lineUnitVecX * projection;
            closestY = lineStart.y + lineUnitVecY * projection;
        }
        
        // Calculate distance from closest point to circle center
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // Check if distance is less than circle radius
        return distance <= circle.radius;
    }
    
    // Spawn a new object based on game mode
    function spawnObject() {
        if (!gameActive) return;
        
        if (gameMode === 1) {
            spawnFlyingObject();
        } else {
            spawnStationaryObject();
        }
    }
    
    // Spawn flying object (Mode 1)
    function spawnFlyingObject() {
        // Randomly select object type
        const typeIndex = Math.floor(Math.random() * objectTypes.length);
        const type = objectTypes[typeIndex];
        
        // Random position at bottom of screen
        const x = Math.random() * canvas.width;
        const y = canvas.height + 50; // Start below screen
        
        // Random horizontal velocity component
        const vx = (Math.random() - 0.5) * 200;
        
        // Vertical velocity (negative means upward)
        const vy = -type.speed - Math.random() * 200;
        
        // Create object
        const object = {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            type: type,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 5,
            sliced: false,
            sliceAngle: 0,
            sliceTime: 0,
            gravity: 500, // Gravity acceleration (pixels/second^2)
            mode: 1
        };
        
        objects.push(object);
        
        // Schedule next spawn
        const nextSpawnTime = 500 + Math.random() * 1000; // Between 0.5 and 1.5 seconds
        setTimeout(spawnFlyingObject, nextSpawnTime);
    }
    
    // Spawn stationary object (Mode 2)
    function spawnStationaryObject() {
        if (objects.length > 0) return; // Only one stationary object at a time
        
        // Randomly select object type
        const typeIndex = Math.floor(Math.random() * stationaryObjects.length);
        const type = stationaryObjects[typeIndex];
        
        // Position in center of screen
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        // Create object
        const object = {
            x: x,
            y: y,
            type: type,
            rotation: 0,
            rotationSpeed: 0,
            sliced: false,
            sliceAngle: 0,
            sliceTime: 0,
            shakeAmount: 0,
            shakeSpeed: 0.1,
            shakePhase: 0,
            slicePosition: 0, // Where the object was sliced (0-1, 0.5 is perfect middle)
            mode: 2
        };
        
        objects.push(object);
    }
    
    // Start game function
    function startGame() {
        // Reset game state
        score = 0;
        scoreElement.textContent = score;
        objects = [];
        slices = [];
        particles = [];
        timeRemaining = gameTime;
        gameActive = true;
        
        // Update UI
        startButton.style.display = 'none';
        restartButton.style.display = 'none';
        
        // Start spawning objects
        spawnObject();
        
        // Start game timer
        gameTimer = setInterval(() => {
            timeRemaining--;
            
            if (timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
        
        // Initialize lastFrameTime to current timestamp to avoid large initial deltaTime
        lastFrameTime = performance.now();
        
        // Start game loop
        requestAnimationFrame(gameLoop);
    }
    
    // End game function
    function endGame() {
        gameActive = false;
        clearInterval(gameTimer);
        
        // Update UI
        restartButton.style.display = 'block';
    }
    
    // Game loop
    function gameLoop(timestamp) {
        // Calculate delta time (time since last frame in seconds)
        const deltaTime = (timestamp - lastFrameTime) / 1000;
        lastFrameTime = timestamp;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw objects
        updateObjects(deltaTime);
        drawObjects();
        
        // Update and draw particles
        updateParticles(deltaTime);
        drawParticles();
        
        // Update and draw slices
        updateSlices(deltaTime);
        drawSlices();
        
        // Draw time remaining
        drawTimeRemaining();
        
        // Continue game loop if game is active
        if (gameActive) {
            requestAnimationFrame(gameLoop);
        }
    }
    
    // Update object positions and states
    function updateObjects(deltaTime) {
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            
            if (obj.mode === 1) {
                // Mode 1: Flying objects
                // Apply gravity
                obj.vy += obj.gravity * deltaTime;
                
                // Update position
                obj.x += obj.vx * deltaTime;
                obj.y += obj.vy * deltaTime;
                
                // Update rotation
                obj.rotation += obj.rotationSpeed * deltaTime;
                
                // If sliced, update slice animation time
                if (obj.sliced) {
                    obj.sliceTime += deltaTime;
                    
                    // Apply different physics to sliced halves
                    if (obj.sliceTime > 1.5) {
                        // Remove object after slice animation completes
                        objects.splice(i, 1);
                    }
                } else {
                    // Remove objects that have fallen off screen
                    if (obj.y > canvas.height + 100) {
                        objects.splice(i, 1);
                    }
                }
            } else if (obj.mode === 2) {
                // Mode 2: Stationary objects
                // Update shake effect if not sliced
                if (!obj.sliced) {
                    obj.shakePhase += obj.shakeSpeed * deltaTime;
                    obj.shakeAmount = Math.sin(obj.shakePhase) * 5;
                } else {
                    // Update slice animation
                    obj.sliceTime += deltaTime;
                    
                    if (obj.sliceTime > 2) {
                        // Remove object after slice animation completes
                        objects.splice(i, 1);
                    }
                }
            }
        }
    }
    
    // Draw all objects
    function drawObjects() {
        objects.forEach(obj => {
            ctx.save();
            
            if (obj.mode === 2 && !obj.sliced) {
                // Apply shake effect for mode 2 unsliced objects
                ctx.translate(obj.x + obj.shakeAmount, obj.y);
            } else {
                // Normal translation
                ctx.translate(obj.x, obj.y);
            }
            
            // Apply rotation
            ctx.rotate(obj.rotation);
            
            // Draw shape based on type
            switch (obj.type.name) {
                case 'circle':
                    drawCircle(obj);
                    break;
                case 'square':
                    drawSquare(obj);
                    break;
                case 'triangle':
                    drawTriangle(obj);
                    break;
                case 'star':
                    drawStar(obj);
                    break;
                case 'hexagon':
                    // Hexagon drawing code would go here
                    break;
                case 'rectangle':
                    // Rectangle drawing code would go here
                    break;
            }
            
            ctx.restore();
        });
    }
    
    // Draw circle object
    function drawCircle(obj) {
        const radius = obj.type.radius;
        
        if (obj.sliced) {
            // Draw sliced circle (two half circles)
            const sliceAngle = obj.sliceAngle;
            
            // First half
            ctx.beginPath();
            ctx.arc(0, 0, radius, sliceAngle - Math.PI/2, sliceAngle + Math.PI/2);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
            
            // Second half (with offset for animation)
            ctx.save();
            const offset = obj.sliceTime * 50;
            ctx.translate(
                Math.cos(sliceAngle + Math.PI/2) * offset,
                Math.sin(sliceAngle + Math.PI/2) * offset
            );
            ctx.beginPath();
            ctx.arc(0, 0, radius, sliceAngle + Math.PI/2, sliceAngle + 3*Math.PI/2);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
            ctx.restore();
        } else {
            // Draw whole circle
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fillStyle = obj.type.color;
            ctx.fill();
        }
    }
    
    // Draw square object
    function drawSquare(obj) {
        const size = obj.type.size;
        const halfSize = size / 2;
        
        if (obj.sliced) {
            // Draw sliced square (two triangles)
            const sliceAngle = obj.sliceAngle;
            const offset = obj.sliceTime * 50;
            
            // Determine slice line endpoints based on angle
            let startX, startY, endX, endY;
            
            // Simplified slicing - just cut along middle
            startX = -halfSize;
            startY = 0;
            endX = halfSize;
            endY = 0;
            
            // First half
            ctx.beginPath();
            ctx.moveTo(-halfSize, -halfSize);
            ctx.lineTo(halfSize, -halfSize);
            ctx.lineTo(halfSize, 0);
            ctx.lineTo(-halfSize, 0);
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
            
            // Second half (with offset for animation)
            ctx.save();
            ctx.translate(0, offset);
            ctx.beginPath();
            ctx.moveTo(-halfSize, 0);
            ctx.lineTo(halfSize, 0);
            ctx.lineTo(halfSize, halfSize);
            ctx.lineTo(-halfSize, halfSize);
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
            ctx.restore();
        } else {
            // Draw whole square
            ctx.fillStyle = obj.type.color;
            ctx.fillRect(-halfSize, -halfSize, size, size);
        }
    }
    
    // Draw triangle object
    function drawTriangle(obj) {
        const size = obj.type.size;
        
        if (obj.sliced) {
            // Draw sliced triangle (two parts)
            const sliceAngle = obj.sliceAngle;
            const offset = obj.sliceTime * 50;
            
            // Simplified slicing - just cut horizontally
            // First half
            ctx.beginPath();
            ctx.moveTo(0, -size/2);
            ctx.lineTo(-size/2, size/4);
            ctx.lineTo(0, 0);
            ctx.lineTo(size/2, size/4);
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
            
            // Second half (with offset for animation)
            ctx.save();
            ctx.translate(0, offset);
            ctx.beginPath();
            ctx.moveTo(-size/2, size/4);
            ctx.lineTo(0, 0);
            ctx.lineTo(size/2, size/4);
            ctx.lineTo(0, size/2);
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
            ctx.restore();
        } else {
            // Draw whole triangle
            ctx.beginPath();
            ctx.moveTo(0, -size/2);
            ctx.lineTo(-size/2, size/4);
            ctx.lineTo(size/2, size/4);
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
        }
    }
    
    // Draw star object
    function drawStar(obj) {
        const size = obj.type.size;
        const outerRadius = size / 2;
        const innerRadius = size / 4;
        const spikes = 5;
        
        if (obj.sliced) {
            // Draw sliced star (two parts)
            const sliceAngle = obj.sliceAngle;
            const offset = obj.sliceTime * 50;
            
            // Simplified slicing - just cut horizontally
            // First half (top)
            ctx.beginPath();
            for (let i = 0; i < spikes; i++) {
                const outerAngle = (Math.PI / spikes) * (2 * i) - Math.PI / 2;
                const innerAngle = (Math.PI / spikes) * (2 * i + 1) - Math.PI / 2;
                
                // Only draw points above the slice line
                const outerY = Math.sin(outerAngle) * outerRadius;
                const innerY = Math.sin(innerAngle) * innerRadius;
                
                if (outerY <= 0) {
                    const outerX = Math.cos(outerAngle) * outerRadius;
                    if (i === 0) {
                        ctx.moveTo(outerX, outerY);
                    } else {
                        ctx.lineTo(outerX, outerY);
                    }
                    
                    if (innerY <= 0) {
                        const innerX = Math.cos(innerAngle) * innerRadius;
                        ctx.lineTo(innerX, innerY);
                    } else {
                        ctx.lineTo(Math.cos(innerAngle) * innerRadius, 0);
                    }
                } else if (i === 0) {
                    ctx.moveTo(Math.cos(outerAngle) * outerRadius, 0);
                }
            }
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
            
            // Second half (bottom, with offset for animation)
            ctx.save();
            ctx.translate(0, offset);
            ctx.beginPath();
            for (let i = 0; i < spikes; i++) {
                const outerAngle = (Math.PI / spikes) * (2 * i) - Math.PI / 2;
                const innerAngle = (Math.PI / spikes) * (2 * i + 1) - Math.PI / 2;
                
                // Only draw points below the slice line
                const outerY = Math.sin(outerAngle) * outerRadius;
                const innerY = Math.sin(innerAngle) * innerRadius;
                
                if (outerY >= 0) {
                    const outerX = Math.cos(outerAngle) * outerRadius;
                    if (i === 0 || Math.sin((Math.PI / spikes) * (2 * (i-1)) - Math.PI / 2) * outerRadius < 0) {
                        ctx.moveTo(outerX, outerY);
                    } else {
                        ctx.lineTo(outerX, outerY);
                    }
                    
                    if (innerY >= 0) {
                        const innerX = Math.cos(innerAngle) * innerRadius;
                        ctx.lineTo(innerX, innerY);
                    }
                } else if (innerY >= 0) {
                    ctx.lineTo(Math.cos(innerAngle) * innerRadius, innerY);
                }
            }
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
            ctx.restore();
        } else {
            // Draw whole star
            ctx.beginPath();
            for (let i = 0; i < spikes; i++) {
                const outerAngle = (Math.PI / spikes) * (2 * i) - Math.PI / 2;
                const innerAngle = (Math.PI / spikes) * (2 * i + 1) - Math.PI / 2;
                
                const outerX = Math.cos(outerAngle) * outerRadius;
                const outerY = Math.sin(outerAngle) * outerRadius;
                
                const innerX = Math.cos(innerAngle) * innerRadius;
                const innerY = Math.sin(innerAngle) * innerRadius;
                
                if (i === 0) {
                    ctx.moveTo(outerX, outerY);
                } else {
                    ctx.lineTo(outerX, outerY);
                }
                
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fillStyle = obj.type.color;
            ctx.fill();
        }
    }
    
    // Update slice effects
    function updateSlices(deltaTime) {
        for (let i = slices.length - 1; i >= 0; i--) {
            const slice = slices[i];
            
            // Update time left for slice effect
            slice.timeLeft -= deltaTime;
            
            // Remove slice if time expired
            if (slice.timeLeft <= 0) {
                slices.splice(i, 1);
            }
        }
    }
    
    // Draw slice effects
    function drawSlices() {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        
        slices.forEach(slice => {
            // Calculate opacity based on time left
            const opacity = slice.timeLeft / 0.2; // 0.2 is the initial time
            ctx.globalAlpha = opacity;
            
            // Draw slice line
            ctx.beginPath();
            ctx.moveTo(slice.x, slice.y);
            ctx.lineTo(
                slice.x + Math.cos(slice.angle) * slice.length,
                slice.y + Math.sin(slice.angle) * slice.length
            );
            ctx.stroke();
            
            // Reset opacity
            ctx.globalAlpha = 1.0;
        });
    }
    
    // Draw time remaining
    function drawTimeRemaining() {
        // Draw time bar at top of screen
        const barWidth = canvas.width * 0.8;
        const barHeight = 10;
        const barX = (canvas.width - barWidth) / 2;
        const barY = 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Time remaining fill
        const fillWidth = (timeRemaining / gameTime) * barWidth;
        
        // Change color based on time remaining
        if (timeRemaining > gameTime * 0.6) {
            ctx.fillStyle = '#74ee15'; // Green
        } else if (timeRemaining > gameTime * 0.3) {
            ctx.fillStyle = '#ffcc00'; // Yellow
        } else {
            ctx.fillStyle = '#ff3c6d'; // Red
        }
        
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
});
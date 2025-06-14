import { supabase } from './supabaseConfig.js';
import { GameOverScene } from './gameOverScene.js';
import { TitleScene } from './titleScene.js';

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log('Device detection:', { isMobile, userAgent: navigator.userAgent });

export class MainGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGame' });
        console.log('MainGame: Constructor called');
        
        // Initialize control states
        this.controlStates = {
            up: false,
            down: false,
            right: false
        };

        // Bind methods to this instance
        this.setupMobileControls = this.setupMobileControls.bind(this);
        this.collectCoin = this.collectCoin.bind(this);
        this.collectMatcha = this.collectMatcha.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.victory = this.victory.bind(this);
        this.pauseGame = this.pauseGame.bind(this);
        this.resumeGame = this.resumeGame.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.autoSpeed = 200; // Automatic forward speed (pixels/sec)
        // Store button references for cleanup
        this.mobileButtons = [];
    }

    preload() {
        console.log('MainGame: preload started');
        // Load the new London background
        this.load.image('london_1', 'assets/london 1.png');
        this.load.image('london_tile', 'assets/london_tile.png');
    this.load.spritesheet('hive', 'assets/bee_hive.png', {
      frameWidth: 48,  // 192/4 = 48 (assuming 4 frames horizontally)
      frameHeight: 48
    });
    this.load.spritesheet('boz', 'assets/bee_fly_sheet.png', {
      frameWidth: 32, // Adjust based on your sprite size
      frameHeight: 32
    });
    this.load.spritesheet('coin', 'assets/coin_floating.png', {
      frameWidth: 192,
      frameHeight: 192
    });
    this.load.spritesheet('matcha', 'assets/matcha_bounce_sprite.png', {
      frameWidth: 200,  // 800/4 = 200 (since it's 4 frames horizontally)
      frameHeight: 192
    });
    this.load.spritesheet('police', 'assets/police_w_left.png', {
      frameWidth: 200,  // 800/4 = 200 since it's 4 frames horizontally
      frameHeight: 192
    });
    this.load.spritesheet('crow', 'assets/crow_flap.png', {
      frameWidth: 96,  // 576/6 = 96 since it appears to be 6 frames horizontally
      frameHeight: 96
    });
        console.log('MainGame: preload completed');
    }

    create() {
        console.log('MainGame: create started');
        
        try {
            // Store background music reference from title scene
            this.backgroundMusic = this.scene.settings.data.backgroundMusic;
            console.log('MainGame: Background music reference:', !!this.backgroundMusic);

            // Mobile controls setup
            if (isMobile) {
                console.log('MainGame: Setting up mobile controls...');
                this.setupMobileControls();
                console.log('MainGame: Mobile controls setup completed');
            }

    // Calculate world dimensions
            const londonWidth = 4950; // Width of london_1.png
            const firstTwoTilesWidth = londonWidth * 2; // Two london_1 backgrounds
            const lastTileWidth = 659; // Width of london_tile
            const worldWidth = firstTwoTilesWidth + lastTileWidth;
    
    // We want 10km to be reached at about 80% into the last tile
    const tenKmPoint = firstTwoTilesWidth + (lastTileWidth * 0.8); // Point where 10km is reached
    
            // Calculate pixels to meters ratio
            this.pixelsToMeters = 10000 / tenKmPoint; // Calculate ratio based on 10km point
            const kmInPixels = 1000 / this.pixelsToMeters; // How many pixels equals 1km
            
            // Set up camera and world bounds
    this.cameras.main.setBounds(0, 0, worldWidth, 600);
    this.physics.world.setBounds(0, 0, worldWidth, 600);
            
            // Center the camera on the starting position
            this.cameras.main.centerOn(400, 300);
            
            console.log('MainGame: World bounds set:', { worldWidth, tenKmPoint, kmInPixels });

            // Log camera setup
            console.log('MainGame: Camera setup:', {
                bounds: this.cameras.main.getBounds(),
                visible: this.cameras.main.visible,
                width: this.cameras.main.width,
                height: this.cameras.main.height
            });
  
    // Initialize pause state
    this.isPaused = false;
    
    // Add pause text (hidden by default)
            this.pauseText = this.add.text(400, 300, 'PAUSED\nTap anywhere to resume', {
        fontSize: '32px',
        color: '#fff',
        align: 'center'
    }).setOrigin(0.5);
    this.pauseText.setScrollFactor(0); // Fix to camera
    this.pauseText.setVisible(false);

    // Add spacebar input
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
    // Place first background
            this.add.image(0, 0, 'london_1').setOrigin(0, 0).setDepth(0);
    // Place second background
            this.add.image(londonWidth, 0, 'london_1').setOrigin(0, 0).setDepth(0);
    // Place third background (last tile)
            this.add.image(firstTwoTilesWidth, 0, 'london_tile').setOrigin(0, 0).setDepth(0);
    
    // Store the 10km point for distance calculations
    this.tenKmPoint = tenKmPoint;

    // Create hive animation
    this.anims.create({
      key: 'glow',
      frames: this.anims.generateFrameNumbers('hive', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    // Add the hive at the 10km point
    const hive = this.physics.add.sprite(this.tenKmPoint, 300, 'hive');
    hive.setScale(1.5); // Increased scale for better visibility
    hive.setImmovable(true);
    hive.play('glow'); // Start the animation
    this.hive = hive;

    // Boz the bee - start at x=0 for more precise distance calculation
    const boz = this.physics.add.sprite(0, 300, 'boz').setDepth(1);
    boz.setCollideWorldBounds(true);
    boz.body.setSize(16, 16); // Much smaller collision box
    boz.body.setOffset(8, 8); // Center the collision box within the sprite
    boz.setScale(2); // Makes Boz twice as big
    boz.setBounce(0); // No bounce when colliding
    this.boz = boz;
    this.startX = boz.x; // Store starting x position
  
            // Camera follows Boz with lerp (smooth follow)
    this.cameras.main.startFollow(boz, true, 0.1, 0.1);
            this.cameras.main.setFollowOffset(-200, 0); // Offset to show more of the path ahead
  
    // Animation for Boz
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('boz', { start: 0, end: 5 }), // Adjust frame numbers
      frameRate: 10,
      repeat: -1
    });
    boz.play('fly');
  
    // UI: Distance and Hive Coins
    this.startTime = this.time.now;
    this.totalDistance = 10000; // meters (10km)
    this.distanceText = this.add.text(580, 20, 'Distance: 0.0 m', {
      fontSize: '20px',
      color: '#fff'
    }).setDepth(2).setScrollFactor(0);
    this.score = 0;
    this.coinsText = this.add.text(580, 50, 'Hive Coins: 0', {
      fontSize: '20px',
      color: '#fff'
    }).setDepth(2).setScrollFactor(0);
  
    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
  
            // Initialize all physics groups first
    this.coins = this.physics.add.group();
            this.matchas = this.physics.add.group();
            this.police = this.physics.add.group();
            this.crows = this.physics.add.group();
  
            const coinGroups = 20; // 20 groups of coins
  
    this.anims.create({
      key: 'spin',
                frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
  
            // Create coin patterns
    for (let i = 0; i < coinGroups; i++) {
                const patternType = Phaser.Math.Between(1, 3); // Random pattern type (1-3)
      const startX = Phaser.Math.Between(400, worldWidth - 400);
                // Keep coins above police height (525) with some margin
                const startY = Phaser.Math.Between(150, 450);
  
                switch(patternType) {
                    case 1: // Diagonal line
                        for (let j = 0; j < 5; j++) {
                            const coin = this.coins.create(
                                startX + (j * 40), 
                                startY - (j * 40), // Going upward diagonally
                                'coin'
                            );
                            this.setupCoin(coin);
                        }
                        break;
                        
                    case 2: // Circle pattern
                        const radius = 60;
                        for (let j = 0; j < 8; j++) {
                            const angle = (j / 8) * Math.PI * 2;
                            const x = startX + Math.cos(angle) * radius;
                            const y = startY + Math.sin(angle) * radius;
                            const coin = this.coins.create(x, y, 'coin');
                            this.setupCoin(coin);
                        }
                        break;
                        
                    case 3: // Dense cluster
                        for (let j = 0; j < 3; j++) {
                            for (let k = 0; k < 3; k++) {
                                const coin = this.coins.create(
                                    startX + (j * 30), 
                                    startY - (k * 30), // Going upward
                                    'coin'
                                );
                                this.setupCoin(coin);
                            }
                        }
                        break;
      }
    }
  
    // Create matcha animation
    this.anims.create({
      key: 'bounce',
      frames: this.anims.generateFrameNumbers('matcha', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  
            // Place more matcha powerups with different point values
            const matchaTypes = [
                { scale: 0.3, points: 1 },
                { scale: 0.4, points: 2 },
                { scale: 0.5, points: 5 }
            ];
            
            const matchaCount = 15; // Increased from 5 to 15
            for (let i = 0; i < matchaCount; i++) {
                const startX = Phaser.Math.Between(1000, worldWidth - 1000);
                const startY = Phaser.Math.Between(100, 500);
                const type = matchaTypes[Phaser.Math.Between(0, matchaTypes.length - 1)];
      
                const matcha = this.matchas.create(startX, startY, 'matcha');
      matcha.setImmovable(true);
      matcha.setDepth(1);
                matcha.setScale(type.scale);
      matcha.play('bounce');
                matcha.pointValue = type.points; // Store point value for collection
    }
  
    // Create police animation with slower frameRate
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('police', { start: 0, end: 3 }),
      frameRate: 5, // Reduced from 8 to 5 for slower animation
      repeat: -1
    });
  
    // Create group for police
    const police = this.police.create(kmInPixels, 525, 'police'); // Start at 1km mark
    police.setScale(0.4);
    police.setVelocityX(-80);
    police.setImmovable(true);
    police.setBounce(0);
    // Adjust collision box size and position
    police.body.setSize(100, 150); // Width: 100px, Height: 150px (half of original 200x192)
    police.body.setOffset(50, 30); // Offset from left: 50px, from top: 30px
    police.play('walk');
    police.setDepth(1);
  
    // Create crow animation
    this.anims.create({
      key: 'flap',
      frames: this.anims.generateFrameNumbers('crow', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: -1
    });
  
            // Create group for crows with more varied patterns
            const numberOfCrows = 6; // Doubled from 3 to 6
            const crowHeights = [150, 250, 350, 450];
            const crowSpeeds = [-150, -180, -200]; // Different speeds for variety
  
    for (let i = 0; i < numberOfCrows; i++) {
                const startX = kmInPixels * (i + 1.5); // More evenly spaced starting positions
                const height = crowHeights[Phaser.Math.Between(0, crowHeights.length - 1)];
                const speed = crowSpeeds[Phaser.Math.Between(0, crowSpeeds.length - 1)];
                
                const crow = this.crows.create(startX, height, 'crow');
                crow.setScale(0.6);
                crow.setVelocityX(speed);
      crow.setImmovable(true);
      crow.setBounce(0);
      crow.body.setSize(60, 40);
      crow.body.setOffset(20, 30);
      crow.play('flap');
      crow.setDepth(1);
                
                // Add vertical movement
                const amplitude = Phaser.Math.Between(30, 70); // Random amplitude
                const frequency = Phaser.Math.Between(2000, 3000); // Random frequency
                
                // Store original Y position and movement parameters
                crow.originalY = height;
                crow.amplitude = amplitude;
                crow.frequency = frequency;
                crow.elapsedTime = Phaser.Math.Between(0, frequency); // Random start phase
    }
  
    // Add collision detection for coins
            this.physics.add.overlap(this.boz, this.coins, this.collectCoin, null, this);
    
    // Add collision detection for matcha
            this.physics.add.overlap(this.boz, this.matchas, this.collectMatcha, null, this);
  
    // Add collision detection for police
            this.physics.add.collider(this.boz, this.police, this.gameOver, null, this);

    // Add collision detection for crows
            this.physics.add.collider(this.boz, this.crows, this.gameOver, null, this);

    // Add collision detection for hive
            this.physics.add.overlap(this.boz, this.hive, this.victory, null, this);

    // Set up movement constants
    this.movementSpeed = 200;
    this.acceleration = 20;

            console.log('MainGame: create completed');
        } catch (error) {
            console.error('MainGame: Error in create method:', error);
        }

        // Clean up any old mobile buttons if they exist
        if (this.mobileButtons && this.mobileButtons.length) {
            this.mobileButtons.forEach(btn => btn.destroy());
            this.mobileButtons = [];
        }
        // Ensure mobile controls are set up on mobile
        if (isMobile) {
            this.setupMobileControls();
        }
    }

    setupMobileControls() {
        // Only create up and down circular buttons for mobile, on the right
        const buttonSize = Math.min(this.cameras.main.width, this.cameras.main.height) * 0.13;
        const padding = buttonSize * 0.3;
        const rightEdge = this.cameras.main.width - buttonSize - padding;
        const centerY = this.cameras.main.height / 2;
        // Helper to create a circular button with label and rectangular hit area
        const createCircleButton = (x, y, label) => {
            const container = this.add.container(x, y);
            // Draw circle
            const circle = this.add.graphics();
            circle.fillStyle(0x000000, 0.3); // Black, low opacity
            circle.lineStyle(5, 0xffffff, 0.7); // White border, semi-opaque
            circle.strokeCircle(0, 0, buttonSize / 2);
            circle.fillCircle(0, 0, buttonSize / 2);
            // Add label
            const text = this.add.text(0, 0, label, {
                fontSize: `${buttonSize * 0.32}px`,
                fontFamily: 'Arial Black',
                color: '#ffffff',
                align: 'center',
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 4
            }).setOrigin(0.5);
            container.add([circle, text]);
            container.setSize(buttonSize, buttonSize);
            // Use a larger rectangular hit area for higher responsiveness
            const hitAreaSize = buttonSize * 1.7;
            container.setInteractive(new Phaser.Geom.Rectangle(-hitAreaSize/2, -hitAreaSize/2, hitAreaSize, hitAreaSize), Phaser.Geom.Rectangle.Contains);
            container.setScrollFactor(0);
            return container;
        };
        // Up button (above center)
        this.upButton = createCircleButton(
            rightEdge,
            centerY - buttonSize - padding / 2,
            'UP'
        );
        // Down button (below center)
        this.downButton = createCircleButton(
            rightEdge,
            centerY + buttonSize + padding / 2,
            'DOWN'
        );
        // Set up touch events
        const handleTouchStart = (direction) => {
            this.controlStates[direction] = true;
        };
        const handleTouchEnd = (direction) => {
            this.controlStates[direction] = false;
        };
        this.upButton.on('pointerdown', () => handleTouchStart('up'));
        this.upButton.on('pointerup', () => handleTouchEnd('up'));
        this.upButton.on('pointerout', () => handleTouchEnd('up'));
        this.downButton.on('pointerdown', () => handleTouchStart('down'));
        this.downButton.on('pointerup', () => handleTouchEnd('down'));
        this.downButton.on('pointerout', () => handleTouchEnd('down'));
        // Store for cleanup
        this.mobileButtons = [this.upButton, this.downButton];
    }

    update(time, delta) {
        if (!this.boz || !this.police) {
            console.error('Required game objects not found:', {
                boz: !!this.boz,
                police: !!this.police
            });
            return;
        }

        // Handle pause/resume with spacebar (desktop only)
        if (!isMobile && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (this.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
        }
    }

    // Only update game logic if not paused
    if (!this.isPaused) {
        // Reset velocity
            this.boz.setVelocity(0);

            // Automatic forward movement
            this.boz.setVelocityX(this.autoSpeed);

            // Up/down controls
            if (isMobile) {
                if (this.controlStates.up) {
                    this.boz.setVelocityY(-this.movementSpeed);
                } else if (this.controlStates.down) {
                    this.boz.setVelocityY(this.movementSpeed);
                }
            } else {
                // Desktop up/down
        if (this.cursors.up.isDown) {
                    this.boz.setVelocityY(-this.movementSpeed);
        } else if (this.cursors.down.isDown) {
                    this.boz.setVelocityY(this.movementSpeed);
        }
            }

        // Update police positions
        const kmInPixels = 1000 / this.pixelsToMeters;
            const policeChildren = this.police.getChildren();
            if (policeChildren && policeChildren.length > 0) {
                policeChildren.forEach((police, index) => {
                    if (police.x < this.boz.x - 400) {
                        police.x = this.boz.x + kmInPixels + (index * kmInPixels);
            }
        });
            }

            // Update crow positions with sine wave movement
            const crowChildren = this.crows.getChildren();
            if (crowChildren && crowChildren.length > 0) {
                crowChildren.forEach((crow, index) => {
                    // Reset crow position if it's too far behind Boz
                    if (crow.x < this.boz.x - 400) {
                        // Randomize height and speed when resetting
                        const newHeight = Phaser.Math.Between(150, 450);
                        const newSpeed = Phaser.Math.Between(-200, -150);
                        
                        crow.x = this.boz.x + kmInPixels + (index * kmInPixels * 0.5);
                        crow.y = newHeight;
                        crow.originalY = newHeight;
                        crow.setVelocityX(newSpeed);
                        
                        // Randomize movement parameters
                        crow.amplitude = Phaser.Math.Between(30, 70);
                        crow.frequency = Phaser.Math.Between(2000, 3000);
                        crow.elapsedTime = 0;
                    }
                    
                    // Apply sine wave movement
                    crow.elapsedTime += delta;
                    const sinOffset = Math.sin(crow.elapsedTime * 2 * Math.PI / crow.frequency) * crow.amplitude;
                    crow.y = crow.originalY + sinOffset;
                });
            }

        // Calculate elapsed time
        const elapsed = this.time.now - this.startTime;

        // Calculate distance based on Boz's x position
            const distance = Math.min((this.boz.x) * this.pixelsToMeters, this.totalDistance);

        // Update distance text
        const distanceKm = distance / 1000;
        this.distanceText.setText(`Distance: ${distanceKm.toFixed(2)} km`);

        // Log detailed position and distance info
        console.log({
                bozX: this.boz.x,
            tenKmPoint: this.tenKmPoint,
            currentDistance: distanceKm,
            worldWidth: this.physics.world.bounds.width
        });
    }
    }

    gameOver() {
        if (!this.isGameOver) {
            this.isGameOver = true;
            
            // Stop Boz's movement and any ongoing animations
            this.boz.setVelocity(0, 0);
            this.boz.play('fly');

            // Pause the physics
            this.physics.pause();

            // Stop the music
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }

            // First, smoothly center the camera on Boz
            this.cameras.main.stopFollow();
            this.cameras.main.pan(
                this.boz.x,
                300,
                500, // Duration of pan in ms
                'Quad.easeOut',
                false,
                (camera, progress) => {
                    if (progress === 1) {
                        // Once camera pan is complete, show the game over UI
                        this.showGameOverUI();
                    }
                }
            );
        }
    }

    showGameOverUI() {
        // Create a container for all UI elements that will be fixed to the camera
        const uiContainer = this.add.container(0, 0);
        uiContainer.setScrollFactor(0); // Fix to camera
        
        // Create full-screen semi-transparent dark overlay
        const overlay = this.add.rectangle(
            400, // Half of game width
            300, // Half of game height
            800,
            600,
            0x000000,
            0
        );
        
        overlay.setOrigin(0.5);
        overlay.setScrollFactor(0);
        overlay.setDepth(20);

        // Fade in the overlay
        this.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 300,
            ease: 'Power2'
        });
    
        // Add "Game Over" text with a drop shadow effect
        const gameOverText = this.add.text(400, 225, 'Game Over!', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#FF0000',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        });
        
        gameOverText.setOrigin(0.5);
        gameOverText.setDepth(21);
        gameOverText.setScrollFactor(0);
        gameOverText.setAlpha(0);
    
        // Add score text
        const scoreText = this.add.text(400, 300, `Score: ${this.score}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        scoreText.setOrigin(0.5);
        scoreText.setDepth(21);
        scoreText.setScrollFactor(0);
        scoreText.setAlpha(0);

        // Create a stylish restart button
        const buttonWidth = 200;
        const buttonHeight = 50;
        
        // Button background
        const buttonBackground = this.add.graphics();
        buttonBackground.setScrollFactor(0);
        buttonBackground.setDepth(21);
            
        // Initial button state
        buttonBackground.fillStyle(0xFFD700, 1);
        buttonBackground.lineStyle(2, 0x000000, 1);
        buttonBackground.fillRoundedRect(300, 350, buttonWidth, buttonHeight, 10);
        buttonBackground.strokeRoundedRect(300, 350, buttonWidth, buttonHeight, 10);
        buttonBackground.setAlpha(0);

        // Restart text
        const restartText = this.add.text(400, 375, 'Restart Game', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'center',
            fontWeight: 'bold'
        });
        
        restartText.setOrigin(0.5);
        restartText.setDepth(22);
        restartText.setScrollFactor(0);
        restartText.setAlpha(0);

        // Make button interactive
        const hitArea = new Phaser.Geom.Rectangle(300, 350, buttonWidth, buttonHeight);
        buttonBackground.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
        // Add click handler
        buttonBackground.on('pointerdown', () => {
            // Quick press effect
            this.tweens.add({
                targets: [buttonBackground, restartText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    this.restartGame();
                }
            });
        });

        // Fade in all UI elements with slight delays for a nice effect
        this.tweens.add({
            targets: [gameOverText, scoreText],
            alpha: 1,
            duration: 300,
            delay: 200,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: [buttonBackground, restartText],
            alpha: 1,
            duration: 300,
            delay: 400,
            ease: 'Power2'
        });

        // Disable keyboard controls
        this.input.keyboard.enabled = false;
    }

    restartGame() {
        // Re-enable physics and keyboard controls
        this.physics.resume();
        this.input.keyboard.enabled = true;
        
        // Show mobile controls if on mobile
        if (isMobile) {
            document.querySelector('.mobile-controls').style.display = 'block';
            document.getElementById('pauseButton').style.display = 'block';
        }
        
        // Restart the music
        if (this.backgroundMusic) {
            this.backgroundMusic.play();
        }
        
        // Reset control states for mobile
        if (isMobile) {
            this.controlStates = {
                up: false,
                down: false,
                right: false
            };
        }
        
        // Reset game state
        this.isGameOver = false;
    
    // Reset score
    this.score = 0;
    this.coinsText.setText('Hive Coins: 0');
        
        // Reset Boz position
        this.boz.x = 0;
        this.boz.y = 300;
        this.boz.setVelocity(0, 0);
        
        // Reset camera
        this.cameras.main.scrollX = 0;

    // Reset police position
    const police = this.police.getChildren()[0];
    if (police) {
        police.x = 1000 / this.pixelsToMeters;  // Reset to 1km mark
        police.y = 525;
    }

    // Reset crow positions
        const crowHeights = [150, 250, 350, 450];
    this.crows.getChildren().forEach((crow, index) => {
            crow.x = (index + 1.5) * (1000 / this.pixelsToMeters);  // Reset to original positions
        crow.y = crowHeights[index];
    });
        
        // Reset coins
        this.coins.getChildren().forEach(coin => {
            coin.enableBody(true, coin.x, coin.y, true, true);
        });
        
        // Reset matcha
        this.matchas.getChildren().forEach(matcha => {
            matcha.enableBody(true, matcha.x, matcha.y, true, true);
        });
        
        // Reset game timer
        this.startTime = this.time.now;
        
        // Destroy all game over elements (they will be automatically cleaned up when scene restarts)
        this.scene.restart();
    }

    victory() {
    if (!this.gameWon) {  // Prevent multiple triggers
        this.gameWon = true;
        
        // Stop Boz's movement
        this.boz.setVelocity(0, 0);
        
            // Launch the game over scene with the final score
            this.scene.launch('GameOverScene', { score: this.score });
            
            // Optional: Pause the current scene
            this.scene.pause();
    }
  }

    pauseGame() {
    this.isPaused = true;
    this.pauseText.setVisible(true);
    
    // Pause all physics objects
    this.physics.pause();
    
    // Pause all animations
    this.anims.pauseAll();

        // Pause the music
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
  }

    resumeGame() {
    this.isPaused = false;
    this.pauseText.setVisible(false);
    
    // Resume all physics objects
    this.physics.resume();
    
    // Resume all animations
    this.anims.resumeAll();

        // Resume the music
        if (this.backgroundMusic) {
            this.backgroundMusic.resume();
        }
    }

    setupCoin(coin) {
        coin.setImmovable(true);
        coin.setDepth(1);
        coin.setScale(0.25);
        coin.play('spin');
    }

    collectCoin(boz, coin) {
        coin.disableBody(true, true);
        this.score += 1;
        this.coinsText.setText(`Hive Coins: ${this.score}`);
    }

    collectMatcha(boz, matcha) {
        matcha.disableBody(true, true);
        this.score += matcha.pointValue;
        this.coinsText.setText(`Hive Coins: ${this.score}`);
        
        // Visual feedback for different point values
        const pointText = this.add.text(matcha.x, matcha.y - 20, `+${matcha.pointValue}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: pointText,
            y: pointText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                pointText.destroy();
            }
        });
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1600,
            height: 1200
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    backgroundColor: '#87CEEB', // Sky blue background color
    scene: [
        TitleScene,
        MainGame,
        GameOverScene
    ],
    callbacks: {
        postBoot: function (game) {
            console.log('Game: Post boot callback');
            // Force landscape
            if (isMobile) {
                game.scale.lockOrientation('landscape');
                console.log('Game: Locked orientation to landscape');
            }
        }
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Log game instance creation
console.log('Game: Instance created');

// Add error handler
window.addEventListener('error', function(e) {
    console.error('Game Error:', e.error);
});

// Add resize handler
window.addEventListener('resize', () => {
    if (game.isBooted) {
        game.scale.refresh();
    }
});

// Prevent default touch behaviors on mobile
if (isMobile) {
    window.addEventListener('touchstart', function(e) {
        if (e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'BUTTON') {
            e.preventDefault();
        }
    }, { passive: false });
  }
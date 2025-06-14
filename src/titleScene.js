class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        console.log('TitleScene: preload started');
        // Load title screen image
        this.load.image('game_screen', 'assets/game_screen.png');
        // Load background music
        this.load.audio('background_music', 'assets/buzzin_bees.wav');
        console.log('TitleScene: preload completed');
    }

    create() {
        console.log('TitleScene: create started');
        // Unlock Phaser sound system for mobile
        this.sound.unlock();
        // Add title screen background that fills the screen
        const background = this.add.image(400, 300, 'game_screen');
        
        // Scale the background to cover the entire screen
        const scaleX = this.cameras.main.width / background.width;
        const scaleY = this.cameras.main.height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Create the background music
        this.backgroundMusic = this.sound.add('background_music', {
            volume: 0.5,
            loop: true
        });

        // Create button background (rounded rectangle)
        const buttonWidth = 200;
        const buttonHeight = 60;
        
        // Mobile detection
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        // Set button Y position based on device
        const buttonY = isMobile ? this.cameras.main.height * 0.6 : 450;
        // Create the button container
        const buttonContainer = this.add.container(400, buttonY);
        
        // Draw button background with pixelated edges
        const buttonBackground = this.add.graphics();
        buttonBackground.lineStyle(4, 0x000000, 1);
        buttonBackground.fillStyle(0xFFD700, 1);
        
        // Draw main rectangle
        buttonBackground.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        buttonBackground.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        
        // Add inner shadow/highlight for pixel effect
        buttonBackground.lineStyle(2, 0x000000, 0.3);
        buttonBackground.strokeRoundedRect(-buttonWidth/2 + 4, -buttonHeight/2 + 4, buttonWidth - 8, buttonHeight - 8, 8);

        // Create pixelated START text
        const startText = this.add.text(0, 0, 'START', {
            fontSize: '32px',
            fontFamily: 'monospace',
            color: '#000000',
            align: 'center',
            fontStyle: 'bold'
        })
        .setOrigin(0.5)
        .setDepth(1);

        // Add elements to container
        buttonContainer.add([buttonBackground, startText]);
        
        // Make container interactive
        buttonContainer.setSize(buttonWidth, buttonHeight);
        buttonContainer.setInteractive({ useHandCursor: true });

        // Add hover effects
        buttonContainer.on('pointerover', () => {
            buttonBackground.clear();
            buttonBackground.lineStyle(4, 0x000000, 1);
            buttonBackground.fillStyle(0xFFA500, 1); // Darker gold on hover
            buttonBackground.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonBackground.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonBackground.lineStyle(2, 0x000000, 0.3);
            buttonBackground.strokeRoundedRect(-buttonWidth/2 + 4, -buttonHeight/2 + 4, buttonWidth - 8, buttonHeight - 8, 8);
            
            this.tweens.add({
                targets: buttonContainer,
                scale: 1.05,
                duration: 100
            });
        });
        
        buttonContainer.on('pointerout', () => {
            buttonBackground.clear();
            buttonBackground.lineStyle(4, 0x000000, 1);
            buttonBackground.fillStyle(0xFFD700, 1); // Back to original gold
            buttonBackground.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonBackground.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            buttonBackground.lineStyle(2, 0x000000, 0.3);
            buttonBackground.strokeRoundedRect(-buttonWidth/2 + 4, -buttonHeight/2 + 4, buttonWidth - 8, buttonHeight - 8, 8);
            
            this.tweens.add({
                targets: buttonContainer,
                scale: 1,
                duration: 100
            });
        });

        // Add click handler
        buttonContainer.on('pointerdown', () => {
            // Resume audio context if suspended (for iOS/Android)
            if (this.sound.context && this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }
            console.log('TitleScene: Start button clicked');
            // Start playing the music
            this.backgroundMusic.play();
            
            // Add a flash effect
            this.cameras.main.flash(500);
            
            // Wait for flash to complete before changing scene
            this.time.delayedCall(500, () => {
                console.log('TitleScene: Starting MainGame scene');
                // Pass the music reference to the main game scene
                this.scene.start('MainGame', { backgroundMusic: this.backgroundMusic });
            });
        });

        // Add subtle floating animation to the button container
        this.tweens.add({
            targets: buttonContainer,
            y: buttonContainer.y + 10,
            yoyo: true,
            repeat: -1,
            duration: 2000,
            ease: 'Sine.inOut'
        });

        console.log('TitleScene: create completed');
    }
}

export { TitleScene }; 
import { supabase } from './supabaseConfig.js';

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.leaderboardData = [];
    }

    init(data) {
        this.finalScore = data.score;
    }

    create() {
        // Create semi-transparent background
        this.add.rectangle(0, 0, 800, 600, 0x000000, 0.7)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(10);

        // Welcome message
        this.add.text(400, 100, 'Welcome to the Hive!', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FFD700',
            align: 'center'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(11);

        // Score display
        this.add.text(400, 180, `Your Score: ${this.finalScore}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            align: 'center'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(11);

        // Create form elements
        this.createForm();
        
        // Create leaderboard
        this.createLeaderboard();
    }

    createForm() {
        const formContainer = document.createElement('div');
        formContainer.style.position = 'absolute';
        formContainer.style.top = '250px';
        formContainer.style.left = '50%';
        formContainer.style.transform = 'translateX(-50%)';
        formContainer.style.width = '300px';
        formContainer.style.padding = '20px';
        formContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        formContainer.style.borderRadius = '10px';
        formContainer.style.zIndex = '11';
        formContainer.style.textAlign = 'center';
        formContainer.style.boxSizing = 'border-box';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Enter your name';
        nameInput.style.width = '100%';
        nameInput.style.marginBottom = '10px';
        nameInput.style.padding = '8px 0';
        nameInput.style.borderRadius = '5px';
        nameInput.style.border = 'none';
        nameInput.style.textAlign = 'center';
        nameInput.style.fontSize = '16px';
        nameInput.style.boxSizing = 'border-box';
        this.nameInput = nameInput;

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Enter your email';
        emailInput.style.width = '100%';
        emailInput.style.marginBottom = '10px';
        emailInput.style.padding = '8px 0';
        emailInput.style.borderRadius = '5px';
        emailInput.style.border = 'none';
        emailInput.style.textAlign = 'center';
        emailInput.style.fontSize = '16px';
        emailInput.style.boxSizing = 'border-box';
        this.emailInput = emailInput;

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit Score';
        submitButton.style.width = '80%';
        submitButton.style.padding = '10px 0';
        submitButton.style.backgroundColor = '#FFD700';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '5px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.fontWeight = 'bold';
        submitButton.style.fontSize = '16px';
        submitButton.style.textAlign = 'center';
        submitButton.style.display = 'block';
        submitButton.style.margin = '0 auto';
        submitButton.style.boxSizing = 'border-box';

        submitButton.onclick = () => this.submitScore();

        formContainer.appendChild(nameInput);
        formContainer.appendChild(emailInput);
        formContainer.appendChild(submitButton);

        document.getElementById('game').appendChild(formContainer);
        this.formContainer = formContainer;
    }

    async createLeaderboard() {
        try {
            // Create leaderboard container
            const leaderboardContainer = this.add.container(400, 300);
            leaderboardContainer.setDepth(30);
            leaderboardContainer.setAlpha(0);

            // Create background panel
            const panel = this.add.rectangle(0, 0, 500, 400, 0x000000);
            panel.setStrokeStyle(2, 0x00FFFF);
            panel.setAlpha(0.9);
            leaderboardContainer.add(panel);

            // Add title
            const title = this.add.text(0, -160, 'LEADERBOARD', {
                fontSize: '32px',
                fontFamily: 'Arial Black',
                color: '#00FFFF',
                align: 'center'
            }).setOrigin(0.5);
            leaderboardContainer.add(title);

            // Add column headers
            const headerY = -110;
            const rankHeader = this.add.text(-180, headerY, 'Rank', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFD700',
                align: 'center'
            }).setOrigin(0.5);

            const nameHeader = this.add.text(0, headerY, 'Player', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFD700',
                align: 'center'
            }).setOrigin(0.5);

            const scoreHeader = this.add.text(180, headerY, 'Score', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFD700',
                align: 'center'
            }).setOrigin(0.5);

            leaderboardContainer.add([rankHeader, nameHeader, scoreHeader]);

            // Fetch and display scores
            const { data, error } = await supabase
                .from('scores')
                .select('*')
                .order('score', { ascending: false })
                .limit(10);

            if (error) throw error;

            // Add divider line
            const divider = this.add.graphics();
            divider.lineStyle(2, 0xFFD700, 1);
            divider.lineBetween(-200, headerY + 20, 200, headerY + 20);
            leaderboardContainer.add(divider);

            // Display scores
            const startY = -60;
            const spacing = 35;

            data.forEach((entry, index) => {
                const rankText = this.add.text(-180, startY + (index * spacing), `${index + 1}`, {
                    fontSize: '20px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    align: 'center'
                }).setOrigin(0.5);

                const nameText = this.add.text(0, startY + (index * spacing), entry.player_name, {
                    fontSize: '20px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    align: 'center'
                }).setOrigin(0.5);

                const scoreText = this.add.text(180, startY + (index * spacing), `${entry.score}`, {
                    fontSize: '20px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    align: 'center'
                }).setOrigin(0.5);

                leaderboardContainer.add([rankText, nameText, scoreText]);
            });

            // Add close button
            const closeButton = this.add.text(0, 160, 'Close', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFD700',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive();

            closeButton.on('pointerdown', () => {
                this.tweens.add({
                    targets: leaderboardContainer,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        leaderboardContainer.destroy();
                        this.createPlayAgainButton();
                    }
                });
            });

            leaderboardContainer.add(closeButton);

            // Fade in the leaderboard
            this.tweens.add({
                targets: leaderboardContainer,
                alpha: 1,
                duration: 300,
                ease: 'Power2'
            });

        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }

    async submitScore() {
        const name = this.nameInput.value.trim();
        const email = this.emailInput.value.trim();

        if (!name || !email) {
            alert('Please fill in both name and email');
            return;
        }

        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        try {
            const { error } = await supabase
                .from('scores')
                .insert([
                    {
                        player_name: name,
                        email: email,
                        score: this.finalScore
                    }
                ]);

            if (error) throw error;

            // Remove form
            this.formContainer.remove();
            
            // Show leaderboard
            await this.createLeaderboard();

        } catch (error) {
            console.error('Error submitting score:', error);
            alert('Error submitting score. Please try again.');
        }
    }

    createPlayAgainButton() {
        const button = this.add.text(400, 250, 'Play Again', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFD700',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
            align: 'center'
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(11)
        .setInteractive();

        button.on('pointerdown', () => {
            this.scene.start('MainGame');
        });
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

export { GameOverScene }; 
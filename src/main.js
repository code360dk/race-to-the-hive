import { browserConfig } from './browserConfig.js';
import { mobileConfig } from './mobileConfig.js';

// Device detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Select configuration based on device
const config = isMobile ? mobileConfig : browserConfig;

// Initialize the game
window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
    
    // Handle window resize for mobile
    if (isMobile) {
        window.addEventListener('resize', () => {
            game.scale.resize(window.innerWidth, window.innerHeight);
        });
    }
}); 
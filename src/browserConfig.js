import { TitleScene } from './titleScene.js';
import { MainGame } from './game.js';
import { GameOverScene } from './gameOverScene.js';

export const browserConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [TitleScene, MainGame, GameOverScene],
    pixelArt: false,
    roundPixels: true
}; 
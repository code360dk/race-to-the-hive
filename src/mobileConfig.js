import { TitleScene } from './titleScene.js';
import { MainGame } from './game.js';
import { GameOverScene } from './gameOverScene.js';

export const mobileConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game'
    },
    scene: [TitleScene, MainGame, GameOverScene],
    pixelArt: false,
    roundPixels: true,
    input: {
        touch: true
    }
}; 
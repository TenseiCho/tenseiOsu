import { Game } from 'phaser';
import { Types } from 'phaser';
import { MainMenu } from './scenes/MainMenu';
import { CircleGameplay } from './scenes/CircleGameplay';

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        MainMenu,
        CircleGameplay
    ]
};

export default new Game(config);

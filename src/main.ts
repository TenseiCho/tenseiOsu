import { Game, GameConfig } from 'phaser';
import { MainMenu } from './scenes/MainMenu';
import { CircleGameplay } from './scenes/CircleGameplay';

//  Find out more information about the Game Config at: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: GameConfig = {
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

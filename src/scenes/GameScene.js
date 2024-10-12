import { Scene } from 'phaser';

export class GameScene extends Scene
{
    constructor ()
    {
        super('GameScene');
    }

    create ()
    {
        // This is a placeholder for your game logic
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Scene', 
            { fontSize: '32px', fill: '#fff' });
        text.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}

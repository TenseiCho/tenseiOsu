import { Scene } from 'phaser';

export class GameScene extends Scene
{
    constructor ()
    {
        super('GameScene');
    }

    preload ()
    {
        // Load the Cirno image
        this.load.image('cirno', 'assets/cirno.png');
    }

    create ()
    {
        // Add Cirno as the background
        const cirno = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'cirno');
        
        // Scale the image to fit the screen
        cirno.setScale(Math.max(this.cameras.main.width / cirno.width, this.cameras.main.height / cirno.height));

        // This is a placeholder for your game logic
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Scene', 
            { fontSize: '32px', fill: '#fff' });
        text.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}

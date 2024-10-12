import { Scene } from 'phaser';

export class GameScene extends Scene
{
    constructor ()
    {
        super('GameScene');
        this.music = null;
    }

    preload ()
    {
        // Load the Flandre image
        this.load.image('flandre', 'assets/flandre.png');
        
        // Load the Flandre theme
        this.load.audio('flandreTheme', 'assets/Flandre_Theme.wav');
    }

    create ()
    {
        // Add Flandre as the background
        const flandre = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'flandre');
        
        // Scale the image to fit the screen
        flandre.setScale(Math.max(this.cameras.main.width / flandre.width, this.cameras.main.height / flandre.height));

        // Play the Flandre theme
        this.music = this.sound.add('flandreTheme', { loop: true });
        this.music.play();

        // This is a placeholder for your game logic
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Game Scene', 
            { fontSize: '32px', fill: '#fff' });
        text.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.fadeOutMusic();
        });
    }

    fadeOutMusic() {
        this.tweens.add({
            targets: this.music,
            volume: 0,
            duration: 1000, // 1 second fade out
            onComplete: () => {
                this.music.stop();
                this.scene.start('MainMenu');
            }
        });
    }
}

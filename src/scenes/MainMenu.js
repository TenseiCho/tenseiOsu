import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    preload ()
    {
        this.load.image('logo', 'assets/tenseiOsuGame.png');
    }

    create ()
    {
        const logo = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'logo');
        logo.setOrigin(0.5);
        
        // Set the scale to 0.5 (50% of original size)
        // You can adjust this value to make it smaller or larger as needed
        logo.setScale(0.3);

        this.input.once('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

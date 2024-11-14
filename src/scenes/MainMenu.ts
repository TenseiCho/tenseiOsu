import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    preload(): void {
        this.load.image('logo', 'assets/tenseiOsuGame.png');
    }

    create(): void {
        const logo: GameObjects.Image = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'logo');
        logo.setOrigin(0.5);
        
        // Set the scale to 0.3 (30% of original size)
        logo.setScale(0.3);

        this.input.once('pointerdown', () => {
            this.scene.start('CircleGameplay');
        });
    }
}

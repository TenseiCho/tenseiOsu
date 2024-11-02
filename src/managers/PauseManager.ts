import { Scene, GameObjects } from 'phaser';

export class PauseManager {
    private scene: Scene;
    private paused: boolean = false;
    private pausedText: GameObjects.Text | null = null;
    private mainMenuText: GameObjects.Text | null = null;
    private startText: GameObjects.Text | null = null;
    private retryText: GameObjects.Text | null = null;
    private fadeOverlay: GameObjects.Rectangle | null = null;
    private callbacks: {
        onContinue?: () => void;
        onRetry?: () => void;
        onQuit?: () => void;
    } = {};

    constructor(scene: Scene) {
        this.scene = scene;
    }

    isPaused(): boolean {
        return this.paused;
    }

    showPauseMenu(): void {
        if (this.paused) return;

        this.fadeOverlay = this.scene.add.rectangle(
            0, 0,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000, 0.5
        ).setOrigin(0)
         .setDepth(100)
         .setInteractive();

        const menuItems = [
            { text: 'Continue', y: 60, callback: () => this.callbacks?.onContinue?.() },
            { text: 'Retry', y: 120, callback: () => this.callbacks?.onRetry?.() },
            { text: 'Quit', y: 180, callback: () => this.callbacks?.onQuit?.() }
        ];

        [this.startText, this.retryText, this.mainMenuText] = menuItems.map(({ text, y, callback }) => {
            const menuItem = this.scene.add.text(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY + y,
                text,
                { 
                    fontSize: '48px', 
                    color: '#fff',
                    fontFamily: 'monospace'
                }
            ).setOrigin(0.5)
             .setDepth(101)
             .setInteractive({ useHandCursor: true })
             .on('pointerup', callback);

            menuItem.on('pointerover', () => {
                menuItem.setScale(1.1);
                menuItem.setStyle({ color: '#00a2ff' });
            });
            
            menuItem.on('pointerout', () => {
                menuItem.setScale(1.0);
                menuItem.setStyle({ color: '#fff' });
            });

            return menuItem;
        });

        this.paused = true;
    }

    hidePauseMenu(): void {
        [this.fadeOverlay, this.pausedText, this.startText, this.retryText, this.mainMenuText]
            .forEach(element => {
                if (element) {
                    element.destroy();
                }
            });

        this.fadeOverlay = null;
        this.pausedText = null;
        this.startText = null;
        this.retryText = null;
        this.mainMenuText = null;
        this.paused = false;
    }

    setCallbacks(callbacks: {
        onContinue: () => void,
        onRetry: () => void,
        onQuit: () => void
    }): void {
        this.callbacks = callbacks;
    }
}
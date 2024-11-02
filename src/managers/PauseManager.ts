import { Scene, GameObjects } from 'phaser';

export class PauseManager {
    private scene: Scene;
    private paused: boolean = false;
    private pausedText: GameObjects.Text | null = null;
    private mainMenuText: GameObjects.Text | null = null;
    private startText: GameObjects.Text | null = null;
    private retryText: GameObjects.Text | null = null;
    private fadeOverlay: GameObjects.Rectangle | null = null;

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
        ).setOrigin(0).setDepth(1);

        this.pausedText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 50,
            'Paused',
            { fontSize: '76px', color: '#fff' }
        ).setOrigin(0.5);

        this.startText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY + 60,
            'Continue',
            { fontSize: '48px', color: '#fff' }
        ).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.retryText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY + 120,
            'Retry',
            { fontSize: '48px', color: '#fff' }
        ).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

            this.mainMenuText = this.scene.add.text(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY + 180,
                'Quit',
                { fontSize: '48px', color: '#fff' }
            ).setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

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
        this.startText?.on('pointerdown', callbacks.onContinue);
        this.retryText?.on('pointerdown', callbacks.onRetry);
        this.mainMenuText?.on('pointerdown', callbacks.onQuit);
    }
}
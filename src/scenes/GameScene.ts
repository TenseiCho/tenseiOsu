import { Scene, Sound, Input, Tweens, GameObjects } from 'phaser';

export class GameScene extends Scene {
    private music: Sound.BaseSound | null = null;
    private paused: boolean = false;
    private pausedText: GameObjects.Text | null = null;
    private mainMenuText: GameObjects.Text | null = null;
    private startText: GameObjects.Text | null = null;
    private retryText: GameObjects.Text | null = null;
    private escapeKey: Input.Keyboard.Key | null = null;
    private handleBlur: () => void;
    private fadeOverlay: GameObjects.Rectangle | null = null;

    constructor() {
        super('GameScene');
        this.handleBlur = this.pauseGame.bind(this);
    }

    preload(): void {
        // Load the Flandre image
        this.load.image('flandre', 'assets/flandre.png');
        
        // Load the Flandre theme
        this.load.audio('flandreTheme', 'assets/Flandre_Theme.wav');
    }

    create(): void {
        // Add Flandre as the background
        const flandre = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'flandre');
        
        // Scale the image to fit the screen
        flandre.setScale(Math.max(this.cameras.main.width / flandre.width, this.cameras.main.height / flandre.height));

        // Play the Flandre theme
        this.music = this.sound.add('flandreTheme', { loop: true });
        this.music.play();

        // Add event listeners for window blur
        window.addEventListener('blur', this.handleBlur);

        // Remove existing pointerdown handler
        this.input.off('pointerdown'); // Remove existing handler

        // Add Escape key listener
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escapeKey.on('down', () => {
            if (this.paused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        });
    }

    pauseGame(): void {
        if (this.paused) return; // Prevent multiple pauses

        // Slightly fade the background by overlaying a semi-transparent rectangle
        this.fadeOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5)
            .setOrigin(0)
            .setDepth(1); // Remove fade overlay

        // Show paused text
        this.pausedText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Paused', 
            { fontSize: '76px', color: '#fff' })
            .setOrigin(0.5); // Position "Paused" text slightly higher

        // Add "Continue" option
        this.startText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 60, 'Continue', 
            { fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.resumeGame());

        // Add "Retry" option
        this.retryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 120, 'Retry', 
            { fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.restartGame());

        // Add "Quit" option
        this.mainMenuText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 180, 'Quit', 
            { fontSize: '48px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.goToMainMenu());

        // Pause music
        this.music?.pause();
        this.paused = true;
    }

    resumeGame(): void {
        if (!this.paused) return; // Prevent resuming if not paused

        // Remove the fade overlay
        if (this.fadeOverlay) {
            this.fadeOverlay.destroy(); // Remove fade overlay
            this.fadeOverlay = null;
        }

        // Hide paused text
        if (this.pausedText) {
            this.pausedText.destroy(); // Remove paused text
            this.pausedText = null;
        }

        // Remove "Continue" option
        if (this.startText) {
            this.startText.destroy(); // Remove Start text
            this.startText = null;
        }

        // Remove "Retry" option
        if (this.retryText) {
            this.retryText.destroy(); // Remove Retry text
            this.retryText = null;
        }

        // Remove "Quit" option
        if (this.mainMenuText) {
            this.mainMenuText.destroy(); // Remove Main Menu text
            this.mainMenuText = null;
        }

        // Resume music
        this.music?.resume();
        this.paused = false;
    }

    goToMainMenu(): void { // Add goToMainMenu method
        // Optionally, stop music or perform any cleanup
        this.music?.stop();
        this.scene.start('MainMenu'); // Transition to Main Menu scene
    }

    fadeOutMusic(): void {
        this.tweens.add({
            targets: this.music,
            volume: 0,
            duration: 1000, // 1 second fade out
            onComplete: () => {
                this.music?.stop();
                this.scene.start('MainMenu');
            }
        });
    }

    shutdown(): void { // Add shutdown method
        window.removeEventListener('blur', this.handleBlur);
    }

    destroy(): void { // Add destroy method
        this.shutdown();
        super.destroy();
    }

    restartGame(): void { // {{ edit_39 }} Add restartGame method
        this.scene.restart(); // Restart the current scene
    }
}
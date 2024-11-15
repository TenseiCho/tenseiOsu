import { Scene, Sound, Input, Tweens, GameObjects, Types } from 'phaser';

export class GameScene extends Scene {
    protected music: Sound.BaseSound | null = null;
    protected paused: boolean = false;
    protected score: number = 0;
    protected combo: number = 0;
    private pausedText: GameObjects.Text | null = null;
    private mainMenuText: GameObjects.Text | null = null;
    private startText: GameObjects.Text | null = null;
    private retryText: GameObjects.Text | null = null;
    private escapeKey: Input.Keyboard.Key | null = null;
    private handleBlur: () => void;
    private fadeOverlay: GameObjects.Rectangle | null = null;
    private scoreText: GameObjects.Text | null = null;
    private scoreNumberText: GameObjects.Text | null = null;
    private blurFilter: Phaser.FX.Blur | null = null;
    private comboText: GameObjects.Text | null = null;
    private comboNumberText: GameObjects.Text | null = null;
    private durationBar: GameObjects.Rectangle | null = null;
    private durationBarBg: GameObjects.Rectangle | null = null;
    private cursor: Phaser.GameObjects.Image | null = null;
    private cursorTrail: Phaser.GameObjects.Image[] = [];
    private readonly MAX_TRAIL_LENGTH = 5; // Adjust this value to change trail length

    constructor(key?: string) {
        super(key || 'GameScene');
        this.handleBlur = this.pauseGame.bind(this);
    }

    preload(): void {
        // Load the Flandre image
        this.load.image('flandre', 'assets/flandre.png');
        
        // Load the Flandre theme
        this.load.audio('flandreTheme', 'assets/Flandre_Theme.wav');
        this.load.image('cursor', 'assets/cursor.png');
        this.load.image('cursortrail', 'assets/cursortrail.png');
    }

    create(): void {
        // Add Flandre as the background
        const flandre = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'flandre');
        
        // Scale the image to fit the screen
        flandre.setScale(Math.max(this.cameras.main.width / flandre.width, this.cameras.main.height / flandre.height));

        // Play the Flandre theme at lower volume
        this.music = this.sound.add('flandreTheme', { 
            loop: true,
            volume: 0.3  // Adjust this value between 0 and 1 (30% volume in this case)
        });
        this.music.play();

        // Add event listeners for window blur
        window.addEventListener('blur', this.handleBlur);

        // Remove existing pointerdown handler
        this.input.off('pointerdown'); // Remove existing handler

        // Add Escape key listener
        if (this.input.keyboard) {
            this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            if (this.escapeKey) {
                this.escapeKey.on('down', () => {
                    if (this.paused) {
                        this.resumeGame();
                    } else {
                        this.pauseGame();
                    }
                });
            }
        }

        // Add score display with blur filter capability
        this.scoreText = this.add.text(40, 40, 'Score', {
            fontSize: '48px',
            color: '#ffffff'
        });

        this.scoreNumberText = this.add.text(40, 100, '000000', {
            fontSize: '42px',
            color: '#ffffff',
            fontFamily: 'monospace'
        });

        // Use proper blur pipeline
        if (this.game.renderer.type === Phaser.WEBGL) {
            const pipeline = (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines;
            const blurPipeline = pipeline.get('BlurPostFX');
            if (blurPipeline) {
                this.scoreText.setPipeline(blurPipeline);
                this.scoreNumberText.setPipeline(blurPipeline);
                this.comboText?.setPipeline(blurPipeline);
                this.comboNumberText?.setPipeline(blurPipeline);
            }
        }

        // Add combo display with blur filter capability (moved up 13 pixels)
        this.comboText = this.add.text(20, this.cameras.main.height - 103, 'Combo', {
            fontSize: '32px',
            color: '#ffffff'
        });

        this.comboNumberText = this.add.text(20, this.cameras.main.height - 63, '0x', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'monospace'
        });

        // Add blur post-processing to combo texts
        this.comboText.setPostPipeline('BlurPostFX');
        this.comboNumberText.setPostPipeline('BlurPostFX');

        // Initialize blur but set to 0
        this.comboText.postFX?.addBlur(0, 0, 0, 4);
        this.comboNumberText.postFX?.addBlur(0, 0, 0, 4);

        // Add duration bar background (gray bar) with padding
        const padding = 20; // 20px padding on each side
        this.durationBarBg = this.add.rectangle(
            padding, // Start after padding
            this.cameras.main.height - 10,
            this.cameras.main.width - (padding * 2), // Total width minus padding on both sides
            5,
            0x333333
        ).setOrigin(0, 0);

        // Add duration bar (blue progress bar)
        this.durationBar = this.add.rectangle(
            padding, // Start after padding
            this.cameras.main.height - 10,
            0,
            5,
            0x00a2ff
        ).setOrigin(0, 0);

        // Update the updateDurationBar method to account for padding
        this.time.addEvent({
            delay: 100,
            callback: this.updateDurationBar,
            callbackScope: this,
            loop: true
        });

        // Hide the default cursor when inside the game canvas
        this.game.canvas.style.cursor = 'none';

        // Create the custom cursor
        this.cursor = this.add.image(0, 0, 'cursor');
        this.cursor.setDepth(1000); // Ensure it's always on top

        // Initialize cursor trail
        for (let i = 0; i < this.MAX_TRAIL_LENGTH; i++) {
            const trail = this.add.image(0, 0, 'cursortrail');
            trail.setAlpha(1 - (i / this.MAX_TRAIL_LENGTH)); // Fade out trail pieces
            trail.setDepth(999 - i); // Stack trail below cursor
            this.cursorTrail.push(trail);
        }

        // Update cursor position on pointer move
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.cursor) {
                this.cursor.setPosition(pointer.x, pointer.y);
                
                // Update trail positions
                for (let i = this.cursorTrail.length - 1; i > 0; i--) {
                    this.cursorTrail[i].setPosition(
                        this.cursorTrail[i - 1].x,
                        this.cursorTrail[i - 1].y
                    );
                }
                if (this.cursorTrail.length > 0) {
                    this.cursorTrail[0].setPosition(pointer.x, pointer.y);
                }
            }
        });
    }

    private updateDurationBar(): void {
        if (this.music && this.durationBar && this.durationBarBg) {
            // Use proper type casting for BaseSound
            const musicSource = this.music as Phaser.Sound.WebAudioSound;
            const progress = musicSource.seek / musicSource.duration;
            const maxWidth = this.cameras.main.width - 40;
            const width = maxWidth * progress;
            this.durationBar.width = width;
        }
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

        // Update blur effects
        if (this.game.renderer.type === Phaser.WEBGL) {
            const pipeline = (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines;
            const blurPipeline = pipeline.get('BlurPostFX') as any;
            if (blurPipeline && typeof blurPipeline.setBlur === 'function') {
                blurPipeline.setBlur(2);
            }
        }

        // Ensure score stays visible above the overlay
        this.scoreText?.setDepth(2);
        this.scoreNumberText?.setDepth(2);

        // Ensure combo stays visible above the overlay
        this.comboText?.setDepth(2);
        this.comboNumberText?.setDepth(2);

        // Ensure duration bars stay visible above overlay
        this.durationBarBg?.setDepth(2);
        this.durationBar?.setDepth(2);

        // Hide cursor and trail during pause
        this.cursor?.setVisible(false);
        this.cursorTrail.forEach(trail => trail.setVisible(false));
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

        // Reset score depth
        this.scoreText?.setDepth(0);
        this.scoreNumberText?.setDepth(0);

        // Reset combo depth
        this.comboText?.setDepth(0);
        this.comboNumberText?.setDepth(0);

        // Update blur effects
        if (this.game.renderer.type === Phaser.WEBGL) {
            const pipeline = (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines;
            const blurPipeline = pipeline.get('BlurPostFX') as any;
            if (blurPipeline && typeof blurPipeline.setBlur === 'function') {
                blurPipeline.setBlur(0);
            }
        }

        // Reset duration bars depth
        this.durationBarBg?.setDepth(0);
        this.durationBar?.setDepth(0);

        // Show cursor and trail when resuming
        this.cursor?.setVisible(true);
        this.cursorTrail.forEach(trail => trail.setVisible(true));
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
        // Restore default cursor when leaving the scene
        this.game.canvas.style.cursor = 'default';
        
        this.shutdown();
    }

    restartGame(): void { // {{ edit_39 }} Add restartGame method
        this.score = 0;
        this.combo = 0; // Reset combo on restart
        if (this.scoreNumberText) {
            this.scoreNumberText.setText('000000');
        }
        if (this.comboNumberText) {
            this.comboNumberText.setText('0x');
        }
        this.scene.restart();
    }

    updateScore(points: number): void {
        this.score += points;
        if (this.scoreNumberText) {
            // Use alternative padding method if needed
            const scoreStr = this.score.toString();
            const paddedScore = '0'.repeat(Math.max(0, 6 - scoreStr.length)) + scoreStr;
            this.scoreNumberText.setText(paddedScore);
        }
    }

    // Add methods to handle combo
    increaseCombo(): void {
        this.combo++;
        if (this.comboNumberText) {
            this.comboNumberText.setText(`${this.combo}x`);
        }
    }

    resetCombo(): void {
        this.combo = 0;
        if (this.comboNumberText) {
            this.comboNumberText.setText('0x');
        }
    }
}

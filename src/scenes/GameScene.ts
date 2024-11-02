import { Scene } from 'phaser';
import { UIManager } from '../managers/UIManager';
import { CursorManager } from '../managers/CursorManager';
import { AudioManager } from '../managers/AudioManager';
import { PauseManager } from '../managers/PauseManager';

export class GameScene extends Scene {
    protected uiManager!: UIManager;
    protected cursorManager!: CursorManager;
    protected audioManager!: AudioManager;
    protected pauseManager!: PauseManager;
    private escapeKey!: Phaser.Input.Keyboard.Key;
    private handleBlur: () => void;

    constructor() {
        super('GameScene');
        this.handleBlur = this.pauseGame.bind(this);
    }

    preload(): void {
        this.load.image('flandre', 'assets/flandre.png');
        this.load.audio('flandreTheme', 'assets/Flandre_Theme.wav');
        this.load.image('cursor', 'assets/cursor.png');
        this.load.image('cursortrail', 'assets/cursortrail.png');
    }

    create(): void {
        // Add background
        const flandre = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'flandre');
        flandre.setScale(Math.max(this.cameras.main.width / flandre.width, this.cameras.main.height / flandre.height));

        // Initialize managers
        this.uiManager = new UIManager(this);
        this.cursorManager = new CursorManager(this);
        this.audioManager = new AudioManager(this);
        this.pauseManager = new PauseManager(this);

        // Setup pause key
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escapeKey.on('down', () => {
            if (this.pauseManager.isPaused()) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        });

        // Start music
        this.audioManager.playMusic();

        // Add blur event listener
        window.addEventListener('blur', this.handleBlur);

        // Setup pause menu callbacks
        this.pauseManager.setCallbacks({
            onContinue: () => this.resumeGame(),
            onRetry: () => this.restartGame(),
            onQuit: () => this.goToMainMenu()
        });
    }

    pauseGame(): void {
        if (this.pauseManager.isPaused()) return;

        this.pauseManager.showPauseMenu();
        this.audioManager.pauseMusic();
        this.uiManager.setBlur(2);
        this.uiManager.setDepth(2);
        this.audioManager.setDurationBarsDepth(2);
        this.cursorManager.setVisible(false);
    }

    resumeGame(): void {
        if (!this.pauseManager.isPaused()) return;

        this.pauseManager.hidePauseMenu();
        this.audioManager.resumeMusic();
        this.uiManager.setBlur(0);
        this.uiManager.setDepth(0);
        this.audioManager.setDurationBarsDepth(0);
        this.cursorManager.setVisible(true);
    }

    async goToMainMenu(): Promise<void> {
        await this.audioManager.fadeOut();
        this.scene.start('MainMenu');
    }

    restartGame(): void {
        this.uiManager.reset();
        this.scene.restart();
    }

    shutdown(): void {
        window.removeEventListener('blur', this.handleBlur);
    }

    destroy(): void {
        this.cursorManager.destroy();
        this.shutdown();
    }
}

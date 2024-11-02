import { Scene, GameObjects } from 'phaser';

export class UIManager {
    private scene: Scene;
    private scoreText: GameObjects.Text | null = null;
    private scoreNumberText: GameObjects.Text | null = null;
    private comboText: GameObjects.Text | null = null;
    private comboNumberText: GameObjects.Text | null = null;
    private score: number = 0;
    private combo: number = 0;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createScoreDisplay();
        this.createComboDisplay();
    }

    private createScoreDisplay(): void {
        this.scoreText = this.scene.add.text(20, 20, 'Score', {
            fontSize: '32px',
            color: '#ffffff'
        });

        this.scoreNumberText = this.scene.add.text(20, 60, '000000', {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'monospace'
        });

        // Add blur post-processing
        this.scoreText.setPostPipeline('BlurPostFX');
        this.scoreNumberText.setPostPipeline('BlurPostFX');
    }

    private createComboDisplay(): void {
        this.comboText = this.scene.add.text(20, this.scene.cameras.main.height - 103, 'Combo', {
            fontSize: '32px',
            color: '#ffffff'
        });

        this.comboNumberText = this.scene.add.text(20, this.scene.cameras.main.height - 63, '0x', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'monospace'  // Added missing property
        });

        // Add blur post-processing
        this.comboText.setPostPipeline('BlurPostFX');
        this.comboNumberText.setPostPipeline('BlurPostFX');
    }

    setBlur(amount: number): void {
        [this.scoreText, this.scoreNumberText, this.comboText, this.comboNumberText].forEach(text => {
            if (text?.postFX) {
                text.postFX.addBlur(amount, amount, 0, 4);
            }
        });
    }

    setDepth(depth: number): void {
        [this.scoreText, this.scoreNumberText, this.comboText, this.comboNumberText].forEach(text => {
            text?.setDepth(depth);
        });
    }

    updateScore(points: number): void {
        this.score += points;
        if (this.scoreNumberText) {
            this.scoreNumberText.setText(this.score.toString().padStart(6, '0'));
        }
    }

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

    reset(): void {
        this.score = 0;
        this.combo = 0;
        if (this.scoreNumberText) {
            this.scoreNumberText.setText('000000');  // Added missing line
        }
        if (this.comboNumberText) {
            this.comboNumberText.setText('0x');
        }
    }
}
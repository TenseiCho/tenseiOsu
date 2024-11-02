import { Scene, Sound } from 'phaser';
import { GameObjects } from 'phaser';

export class AudioManager {
    private scene: Scene;
    private music: Sound.BaseSound | null = null;
    private durationBar: GameObjects.Rectangle | null = null;
    private durationBarBg: GameObjects.Rectangle | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createDurationBars();
    }

    private createDurationBars(): void {
        const padding = 20;
        const height = this.scene.cameras.main.height;
        const width = this.scene.cameras.main.width;

        this.durationBarBg = this.scene.add.rectangle(
            padding,
            height - 10,
            width - (padding * 2),
            5,
            0x333333
        ).setOrigin(0, 0);

        this.durationBar = this.scene.add.rectangle(
            padding,
            height - 10,
            0,
            5,
            0x00a2ff
        ).setOrigin(0, 0);

        this.scene.time.addEvent({
            delay: 100,
            callback: this.updateDurationBar,
            callbackScope: this,
            loop: true
        });
    }

    playMusic(): void {
        this.music = this.scene.sound.add('flandreTheme', { loop: true });
        this.music.play();
    }

    pauseMusic(): void {
        this.music?.pause();
    }

    resumeMusic(): void {
        this.music?.resume();
    }

    stopMusic(): void {
        this.music?.stop();
    }

    private updateDurationBar = (): void => {
        if (this.music && this.durationBar && this.durationBarBg) {
            const progress = (this.music as any).seek / (this.music as any).duration;
            const maxWidth = this.scene.cameras.main.width - 40;
            const width = maxWidth * progress;
            this.durationBar.width = width;
        }
    }

    setDurationBarsDepth(depth: number): void {
        this.durationBarBg?.setDepth(depth);
        this.durationBar?.setDepth(depth);
    }

    fadeOut(): Promise<void> {
        return new Promise((resolve) => {
            this.scene.tweens.add({
                targets: this.music,
                volume: 0,
                duration: 1000,
                onComplete: () => resolve()
            });
        });
    }
}
import { GameScene } from './GameScene';
import { GameObjects } from 'phaser';

export class CircleGameplay extends GameScene {
    private circles: GameObjects.Container[] = [];
    private spawnTimer: Phaser.Time.TimerEvent | null = null;
    private circleTweens: Phaser.Tweens.Tween[] = [];
    
    constructor() {
        super('CircleGameplay');
    }

    preload(): void {
        // Call parent's preload first
        super.preload();
        
        // Load circle assets
        this.load.image('hitcircle', 'assets/circles/hitcircle.png');
        this.load.image('hitcircleoverlay', 'assets/circles/hitcircleoverlay.png');
        this.load.image('approachcircle', 'assets/circles/hitcircleoverlay.png');
        this.load.image('hiteffect', 'assets/circles/hitcircle.png');
        
        // Load hit sounds
        this.load.audio('hitnormal', 'assets/sounds/normal-hitnormal.wav');
        this.load.audio('hitclap', 'assets/sounds/soft-hitclap.wav');
        
        // Load hit particles
        this.load.image('hitparticle', 'assets/particles/particle.png');
    }

    create(): void {
        console.log('CircleGameplay create starting');
        super.create();
        
        // Add keyboard input
        this.input.keyboard?.addKey('Z').on('down', () => this.handleKeyPress());
        this.input.keyboard?.addKey('X').on('down', () => this.handleKeyPress());
        
        console.log('Parent create completed');
        this.initializeCircleGameplay();
        console.log('CircleGameplay initialization completed');
    }

    private initializeCircleGameplay(): void {
        // Initialize circle gameplay mechanics
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.handleCircleClick(pointer);
        });

        // Store the timer reference
        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
                const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
                this.spawnCircle(x, y);
            },
            loop: true
        });
    }

    private handleKeyPress(): void {
        if (this.paused) return;
        
        const pointer = this.input.activePointer;
        this.createHitCircleEffect(pointer.x, pointer.y);
        this.handleCircleClick(pointer);
    }

    private handleCircleClick(pointer: Phaser.Input.Pointer): void {
        if (this.paused) return;
        
        let hitCircle = false;

        // Create a copy of the circles array to avoid modification during iteration
        const currentCircles = [...this.circles];

        for (const circle of currentCircles) {
            // Check if circle is still valid (not destroyed)
            if (!circle || !circle.active) continue;

            const circlePos = circle.getWorldTransformMatrix();
            const distance = Phaser.Math.Distance.Between(
                pointer.x, pointer.y, circlePos.tx, circlePos.ty
            );

            const hitRadius = 50 * 0.5;
            
            if (distance <= hitRadius) {
                hitCircle = true;
                
                // Safely get the approach circle
                const approachCircle = circle.list[2] as Phaser.GameObjects.Image;
                if (!approachCircle) continue;

                const scale = approachCircle.scale;
                const timingDiff = Math.abs(0.5 - scale);
                
                let points = 0;
                let hitSound = 'hitnormal';
                
                if (timingDiff <= 0.05) {
                    points = 300;
                    hitSound = 'hitclap';
                } else if (timingDiff <= 0.1) {
                    points = 100;
                    hitSound = 'hitnormal';
                } else if (timingDiff <= 0.15) {
                    points = 50;
                    hitSound = 'hitnormal';
                }
                
                // Play hit sound
                this.sound.play(hitSound);
                
                // Create hit effect
                this.createHitEffect(circlePos.tx, circlePos.ty, points);
                
                // Update score and combo
                this.updateScore(points);
                if (points > 0) {
                    this.increaseCombo();
                } else {
                    this.resetCombo();
                }
                
                // Remove the circle and its tween
                const index = this.circles.indexOf(circle);
                if (index > -1) {
                    this.circles.splice(index, 1);
                }

                // Find and remove the associated tween
                const tweenIndex = this.circleTweens.findIndex(tween => 
                    tween.targets.includes(approachCircle));
                if (tweenIndex > -1) {
                    this.circleTweens[tweenIndex].stop();
                    this.circleTweens.splice(tweenIndex, 1);
                }

                circle.destroy();
                return;
            }
        }

        // If we didn't hit any circle, play normal hit sound
        if (!hitCircle) {
            this.sound.play('hitnormal');
        }
    }

    private createHitEffect(x: number, y: number, points: number): void {
        // Create particle emitter
        const particles = this.add.particles(x, y, 'hitparticle', {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            quantity: 10,
            blendMode: 'ADD'
        });

        // Show score number
        const scoreText = this.add.text(x, y, points.toString(), {
            fontSize: '32px',
            color: points === 300 ? '#FFD700' : points === 100 ? '#FFFFFF' : '#A9A9A9'
        }).setOrigin(0.5);

        // Animate score text
        this.tweens.add({
            targets: scoreText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                scoreText.destroy();
                particles.destroy();
            }
        });
    }

    private createHitCircleEffect(x: number, y: number): void {
        // Create the hit circle effect
        const hitEffect = this.add.image(x, y, 'hiteffect')
            .setScale(0.3)
            .setAlpha(0.5)
            .setTint(0xFFFFFF);

        // Animate the hit circle
        this.tweens.add({
            targets: hitEffect,
            scale: 0.5,
            alpha: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                hitEffect.destroy();
            }
        });
    }

    private spawnCircle(x: number, y: number): void {
        console.log('Spawning circle at', x, y);
        const circleContainer = this.add.container(x, y);
        
        const hitCircle = this.add.image(0, 0, 'hitcircle');
        hitCircle.setScale(0.5);
        
        const hitCircleOverlay = this.add.image(0, 0, 'hitcircleoverlay');
        hitCircleOverlay.setScale(0.5);
        
        const approachCircle = this.add.image(0, 0, 'approachcircle');
        approachCircle.setScale(1.5);
        
        circleContainer.add([hitCircle, hitCircleOverlay, approachCircle]);
        this.circles.push(circleContainer);
        
        // Store the tween reference
        const tween = this.tweens.add({
            targets: approachCircle,
            scale: 0.5,
            duration: 1000,
            onComplete: () => {
                this.handleMiss(circleContainer);
            }
        });
        
        this.circleTweens.push(tween);
    }

    private handleMiss(circle: GameObjects.Container): void {
        this.resetCombo();
        circle.destroy();
        const index = this.circles.indexOf(circle);
        if (index > -1) {
            this.circles.splice(index, 1);
        }
        // Remove the associated tween
        const tweenIndex = this.circleTweens.findIndex(tween => 
            tween.targets.includes(circle.list[2]));
        if (tweenIndex > -1) {
            this.circleTweens.splice(tweenIndex, 1);
        }
    }

    update(time: number, delta: number): void {
        super.update(time, delta);
        // Add any circle gameplay specific update logic here
    }

    // Override the parent's pauseGame method
    pauseGame(): void {
        super.pauseGame();
        if (this.spawnTimer) {
            this.spawnTimer.paused = true;
        }
        // Pause all circle animations
        this.circleTweens.forEach(tween => {
            tween.pause();
        });
    }

    // Override the parent's resumeGame method
    resumeGame(): void {
        super.resumeGame();
        if (this.spawnTimer) {
            this.spawnTimer.paused = false;
        }
        // Resume all circle animations
        this.circleTweens.forEach(tween => {
            tween.resume();
        });
    }

    // Override the parent's destroy method
    destroy(): void {
        // Clean up the timer when destroying the scene
        this.spawnTimer?.destroy();
        super.destroy();
    }
} 
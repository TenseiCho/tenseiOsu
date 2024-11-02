import { Scene, GameObjects } from 'phaser';

export class CursorManager {
    private scene: Scene;
    private cursor: GameObjects.Image | null = null;
    private cursorTrail: GameObjects.Image[] = [];
    private readonly MAX_TRAIL_LENGTH = 5;

    constructor(scene: Scene) {
        this.scene = scene;
        this.init();
    }

    private init(): void {
        // Hide the default cursor
        this.scene.game.canvas.style.cursor = 'none';

        // Create custom cursor
        this.cursor = this.scene.add.image(0, 0, 'cursor');
        this.cursor.setDepth(1000);

        // Initialize trail
        for (let i = 0; i < this.MAX_TRAIL_LENGTH; i++) {
            const trail = this.scene.add.image(0, 0, 'cursortrail');
            trail.setAlpha(1 - (i / this.MAX_TRAIL_LENGTH));
            trail.setDepth(999 - i);
            this.cursorTrail.push(trail);
        }

        // Update cursor position on pointer move
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.updatePosition(pointer.x, pointer.y);
        });
    }

    private updatePosition(x: number, y: number): void {
        if (this.cursor) {
            this.cursor.setPosition(x, y);
            
            for (let i = this.cursorTrail.length - 1; i > 0; i--) {
                this.cursorTrail[i].setPosition(
                    this.cursorTrail[i - 1].x,
                    this.cursorTrail[i - 1].y
                );
            }
            if (this.cursorTrail.length > 0) {
                this.cursorTrail[0].setPosition(x, y);
            }
        }
    }

    setVisible(visible: boolean): void {
        this.cursor?.setVisible(visible);
        this.cursorTrail.forEach(trail => trail.setVisible(visible));
    }

    destroy(): void {
        this.cursor?.destroy();
        this.cursorTrail.forEach(trail => trail.destroy());
        this.scene.game.canvas.style.cursor = 'default';
    }
}
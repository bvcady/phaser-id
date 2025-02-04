import { Scene } from "phaser";

export class Player extends Phaser.GameObjects.Sprite {
    facing?: "right" | "left" | "up" | "down";
    isMoving: boolean = false;
    dir: "x" | "y";
    inc: number;
    frameRate: number;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, "main_guy");

        this.frameRate = 3.4;

        this.setDepth(4);

        scene.add.existing(this);
        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [5],
            }),
            repeat: 1,
        });
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [6],
            }),
            repeat: 1,
        });
        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [15, 16, 15, 17],
            }),
            frameRate: this.frameRate / 2,
            repeat: -1,
            delay: 3333.33333 / 4,
            showBeforeDelay: true,
        });
        this.anims.create({
            key: "walk_right",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [5, 4],
            }),
            frameRate: this.frameRate,
            repeat: -1,
        });
        this.anims.create({
            key: "walk_left",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [6, 7],
            }),
            frameRate: this.frameRate,
            repeat: -1,
        });
        this.play("idle", true);
        this.setActive(true);
        this.setOrigin(0.5, 0.66);
    }
}


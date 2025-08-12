import { Math as PMath } from "phaser";
import { RoomScene } from "../game/scenes/RoomScene";
import { Cell, Room } from "../types";
import { cellSize } from "../utils/constants";

export class Player extends Phaser.GameObjects.Sprite {
    yOffset: number;
    facing?: "right" | "left" | "up" | "down";
    isMoving: boolean = false;
    dir: "x" | "y";
    inc: number;
    frameRate: number;
    target: PMath.Vector2 = new PMath.Vector2(0, 0);
    prev: string = "down";
    currentCell: Cell;
    roomScene: RoomScene;

    constructor(scene: RoomScene, cell: Cell) {
        super(
            scene,
            cell.position.x * cellSize,
            cell.position.y * cellSize,
            "main_guy"
        );
        this.roomScene = scene;

        this.currentCell = cell;
        this.target = new PMath.Vector2(this.x, this.y);
        this.frameRate = 12;

        this.setDepth(4);

        this.setScale(1, 1);

        scene.add.existing(this);

        this.anims.create({
            key: "walk_horizontal",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [8, 9, 10, 11],
            }),
            frameRate: this.frameRate / 2,
            showBeforeDelay: true,
            repeat: 1,
        });

        this.anims.create({
            key: "walk_down",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [0, 1, 2, 3],
            }),
            frameRate: this.frameRate / 2,
            showBeforeDelay: true,

            repeat: 1,
        });

        this.anims.create({
            key: "walk_up",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [4, 5, 6, 7],
            }),
            frameRate: this.frameRate / 2,
            showBeforeDelay: true,

            repeat: 1,
        });

        this.anims.create({
            key: "idle_down",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [15, 16, 15, 17],
            }),
            frameRate: this.frameRate / 8,
            repeat: -1,
            delay: 3333.33333 / 4,
            showBeforeDelay: true,
        });

        this.anims.create({
            key: "idle_up",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [38, 39, 38, 40],
            }),
            frameRate: this.frameRate / 8,
            repeat: 3,
            delay: 3333.33333 / 4,
            showBeforeDelay: true,
        });
        this.anims.create({
            key: "idle_horizontal",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [54, 53, 54, 55],
            }),
            frameRate: this.frameRate / 8,
            repeat: 3,
            delay: 3333.33333 / 4,
            showBeforeDelay: true,
        });
        this.anims.create({
            key: "in_lava_horizontal",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [43, 44],
            }),
            frameRate: this.frameRate / 4,
            repeat: -1,

            showBeforeDelay: true,
        });
        this.anims.create({
            key: "in_lava_down",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [41, 42],
            }),
            frameRate: this.frameRate / 4,

            repeat: -1,
            showBeforeDelay: true,
        });
        this.anims.create({
            key: "in_lava_up",
            frames: this.anims.generateFrameNumbers("main_guy", {
                frames: [56, 57],
            }),
            frameRate: this.frameRate / 4,

            repeat: -1,

            showBeforeDelay: true,
        });

        this.play("idle_down", true);
        this.setActive(true);
        this.setDisplayOrigin(8, 12);

        this.on("animationcomplete", () => {
            if (
                this.anims.currentAnim?.key === "idle_up" ||
                this.anims.currentAnim?.key === "idle_horizontal"
            ) {
                this.play("idle_down");
            }
        });
    }

    walkUp() {
        this.prev = "up";
        this.setScale(1, 1);
        const dir =
            this.prev === "left" || this.prev === "right"
                ? "horizontal"
                : this.prev;
        this.setScale(this.prev === "right" ? -1 : 1, 1);
        if (this.currentCell.n < 0.5) {
            return this.play(`in_lava_${dir}`);
        }
        return this.play("walk_up", true);
    }
    walkDown() {
        this.prev = "down";
        this.setScale(1, 1);
        const dir =
            this.prev === "left" || this.prev === "right"
                ? "horizontal"
                : this.prev;
        this.setScale(this.prev === "right" ? -1 : 1, 1);
        if (this.currentCell.n < 0.5) {
            return this.play(`in_lava_${dir}`);
        }
        this.play("walk_down", true);
    }
    walkRight() {
        this.prev = "right";
        this.setScale(-1, 1);
        const dir =
            this.prev === "left" || this.prev === "right"
                ? "horizontal"
                : this.prev;
        this.setScale(this.prev === "right" ? -1 : 1, 1);
        if (this.currentCell.n < 0.5) {
            return this.play(`in_lava_${dir}`);
        }
        this.play("walk_horizontal", true);
    }
    walkLeft() {
        this.prev = "left";
        this.setScale(1, 1);
        const dir =
            this.prev === "left" || this.prev === "right"
                ? "horizontal"
                : this.prev;
        this.setScale(this.prev === "right" ? -1 : 1, 1);
        if (this.currentCell.n < 0.5) {
            return this.play(`in_lava_${dir}`);
        }
        this.play("walk_horizontal", true);
    }
    idle() {
        const dir =
            this.prev === "left" || this.prev === "right"
                ? "horizontal"
                : this.prev;
        this.setScale(this.prev === "right" ? -1 : 1, 1);

        if (this.currentCell.n < 0.5) {
            return this.play(`in_lava_${dir}`);
        }
        return this.play(`idle_${dir}`, true);
    }
}


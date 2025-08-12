import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Player } from "../../components/Player";

export class Inventory extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    inventorySprite: Phaser.GameObjects.Sprite;
    idleWalker: Player;

    constructor() {
        super("Inventory");
    }

    create() {
        this.inventorySprite = new Phaser.GameObjects.Sprite(
            this,
            48,
            48,
            "inventory"
        ).setAlpha(0.4);
        this.camera = this.cameras.main;
        this.add.existing(this.inventorySprite);

        this.idleWalker = new Player(this, {
            position: new Phaser.Math.Vector2(3, 3),
            filled: false,
            n: 0.5,
            type: "",
        });

        this.idleWalker.idle();

        EventBus.emit("inventory-scene-ready", this);

        this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
            if (e.key === "h") {
                this.camera.setVisible(!this.camera.visible);
            }
        });
    }
}


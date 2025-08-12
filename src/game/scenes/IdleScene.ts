import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Player } from "../../components/Player";

export class IdleScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    idleWalker: Player;

    constructor() {
        super("IdleScene");
    }

    create() {
        this.idleWalker = new Player(this, {
            position: new Phaser.Math.Vector2(3, 3),
            filled: false,
            n: 0.5,
            type: "",
        });

        this.idleWalker.idle();

        this.camera = this.cameras.main;

        EventBus.emit("idle-walker-scene-ready", this);
    }
}


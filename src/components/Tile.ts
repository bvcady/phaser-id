import { Math as PMath } from "phaser";
import { RoomScene } from "../game/scenes/RoomScene";
import { Cell } from "../types";
import { cellSize } from "../utils/constants";

export class Tile extends Phaser.GameObjects.Sprite {
    id: string;
    frameNumber: number;
    rand: PMath.RandomDataGenerator;
    cell: Cell;
    rScene: RoomScene;
    buoyancy: number;

    constructor(scene: RoomScene, cell: Cell) {
        super(
            scene,
            cell.position.x * cellSize,
            cell.position.y * cellSize,
            "tile"
        );
        this.rScene = scene;
        this.cell = cell;
        this.rand = new PMath.RandomDataGenerator();
        this.id = this.rand.uuid();

        this.setDisplayOrigin(8, 8);

        this.frameNumber = this.rand.integerInRange(0, 15);
        this.setFrame(this.frameNumber);
        this.setActive(true);
        scene.add.existing(this);
    }
}


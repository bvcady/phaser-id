import { Scene } from "phaser";
import { RoomScene } from "./RoomScene";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        this.load.image("background", "assets/bg.png");
        this.load.image(
            "walls_tilemap",
            "assets/SGQ_Dungeon/customized/walls_dungeon.png"
        );
        this.load.image(
            "floor_tilemap",
            "assets/SGQ_Dungeon/customized/lava.png"
        );
        this.load.image(
            "ground_decal_tilemap",
            "assets/SGQ_Dungeon/customized/ground_decals.png"
        );
    }

    create() {
        this.scene.remove("room_0_0");
        this.scene.add("room_0_0", new RoomScene("room_0_0"));
        this.scene.start("room_0_0");
    }
}


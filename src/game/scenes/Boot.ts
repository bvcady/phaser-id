import { Scene } from "phaser";
import { Inventory } from "./Inventory";
import { RoomScene } from "./RoomScene";
import { IdleScene } from "./IdleScene";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        this.load.spritesheet(
            "main_guy",
            "assets/SGQ_Dungeon/customized/player.png",
            {
                frameWidth: 16,
                frameHeight: 16,
                spacing: 0,
            }
        );
        this.load.spritesheet(
            "tile",
            "assets/SGQ_Dungeon/customized/tiles.png",
            {
                frameWidth: 16,
                frameHeight: 16,
                spacing: 0,
            }
        );

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
        this.load.image(
            "inventory",
            "assets/SGQ_Dungeon/customized/inventory.png"
        );
    }

    create() {
        this.scene.add("room_0_0", new RoomScene("room_0_0"));
        this.scene.launch("room_0_0");

        this.scene.add("Inventory", new Inventory());
        this.scene.launch("Inventory");

        // this.scene.add("IdleScene", new IdleScene());
        // this.scene.launch("IdleScene");
    }
}


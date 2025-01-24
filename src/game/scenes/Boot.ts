import { Scene } from "phaser";
import { RoomScene } from "./RoomScene";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
        // this.load.spritesheet(
        //     "walls_tilemap",
        //     "assets/SGQ_Dungeon/customized/walls_dungeon.png",
        //     {
        //         frameWidth: 16,
        //         frameHeight: 16,
        //     }
        // );
        this.load.image("background", "assets/bg.png");
        this.load.image(
            "walls_tilemap",
            "assets/SGQ_Dungeon/customized/walls_dungeon.png"
        );
    }

    create() {
        this.scene.remove("room_0_0");
        this.scene.add("room_0_0", new RoomScene("room_0_0"));
        this.scene.start("room_0_0");
    }
}


import { Math as PMath, Scene, Tilemaps } from "phaser";

import { generateMap } from "../../scripts/generateMap";
import { getWallDisplaySprite } from "../../scripts/getDisplaySprite";
import { Cell } from "../../types";
import { EventBus } from "../EventBus";
// import { Player } from "../player/Player";
// import { generateRoom } from "./roomGeneration";

const cellSize = 8;
const spriteSize = 16;
export class RoomScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    r: PMath.RandomDataGenerator;
    cells: Cell[];
    map: Tilemaps.Tilemap;
    tiles: Tilemaps.Tileset | null;
    wallLayer: Tilemaps.TilemapLayer | null;

    constructor(roomName: string) {
        super(roomName);

        this.r = new PMath.RandomDataGenerator([
            Math.random().toString(36).substring(4).toLocaleUpperCase() +
                roomName,
        ]);
    }

    selectLayer(layer: Tilemaps.TilemapLayer) {
        // You can use map.setLayer(...) or map.layer. Either can be set using a layer name, layer
        // index, StaticTilemapLayer/DynamicTilemapLayer.
        this.map.setLayer(layer);
        layer.alpha = 1;
    }

    // preload() {
    //     this.reset();
    // }

    reset() {
        console.log("resetting map");

        this.map = this.make.tilemap({
            tileWidth: 16,
            tileHeight: 16,
            width: 800,
            height: 800,
        });
        this.tiles = this.map.addTilesetImage(
            "walls_tilemap",
            "walls_tilemap",
            16,
            16
        );
        this.wallLayer = this.map.createBlankLayer("walls", this.tiles!, 0, 0);
        this.selectLayer(this.wallLayer!);

        this.data.set("width", 800);
        this.data.set("height", 800);

        const { cells, rooms, exits } = generateMap({
            width: this.data.get("width"),
            height: this.data.get("height"),
            cellSize,
        });

        this.cells = cells;

        const mappedCells = new Map();

        cells.forEach((c) =>
            mappedCells.set(`${c.position.x} - ${c.position.y}`, c)
        );

        new Array(this.data.get("height") + 1).fill("").map((_, y) =>
            new Array(this.data.get("width") + 1).fill("").map((_, x) => {
                const vector = getWallDisplaySprite({
                    pos: new PMath.Vector2(x, y),
                    cells: mappedCells,
                });
                if (!vector) {
                    return;
                }
                const frame = vector.y * 4 + vector.x;
                console.log("should put tile", frame);
                this.map.putTileAt(frame, x, y);
            })
        );
    }

    create() {
        this.reset();
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(
            Phaser.Display.Color.ValueToColor("black").color32
        );
        this.camera.centerOn(this.data.get("width"), this.data.get("height"));
        // this.camera.setZoom(4);

        EventBus.emit("current-scene-ready", this);
    }

    // update(time: number, delta: number): void {}
}

// this.cells.forEach((c) => {
//     if (!c.filled) {
//         return;
//     }
//     // getSprite({ cell: c, allCells: this.cells });

//     if (c.isWall) {
//         const spriteInfo = getWallDisplaySprite({
//             cells: this.cells,
//             pos: c.position,
//         });

//         const frame = spriteInfo.y * 4 + spriteInfo.x;
//         this.add
//             .rectangle(
//                 c.position.x * spriteSize - spriteSize / 2,
//                 c.position.y * spriteSize,
//                 spriteSize,
//                 spriteSize,
//                 0x000
//             )
//             .setDepth(1);

//         this.add
//             .sprite(
//                 c.position.x * spriteSize - spriteSize / 2,
//                 c.position.y * spriteSize,
//                 "walls_tilemap",
//                 frame
//             )
//             .setDepth(c.position.y * spriteSize - spriteSize / 2);
//     }

// this.add
//     .rectangle(
//         c.position.x * cellSize,
//         c.position.y * cellSize - (c.isWall ? 0.5 : 0) * cellSize,
//         cellSize,
//         cellSize * 3.5,
//         c.isFloor
//             ? new Phaser.Display.Color(200, 200, 200).color32
//             : new Phaser.Display.Color(20, 20, 20).color32
//     )
//     .setAlpha(c.isFloor ? c.n : 1)
//     .setVisible(true);
// });

// rooms.forEach((r) => {
//     const roomCircle = this.add.graphics();

//     const color = Phaser.Display.Color.ValueToColor("#0a0000").color32;
//     const thickness = 2;
//     const alpha = 1;

//     roomCircle.lineStyle(thickness, color, alpha);

//     const a = new Phaser.Geom.Point(r.position.x, r.position.y);
//     const radius = r.radius;

//     roomCircle.strokeCircle(a.x, a.y, radius);

// });


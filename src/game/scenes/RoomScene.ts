import { Math as PMath, Scene, Tilemaps } from "phaser";

import { Player } from "../../components/Player";
import { generateMap, mapValues } from "../../scripts/generateMap";
import {
    getFloorDisplaySprite,
    getWallDisplaySprite,
} from "../../scripts/getDisplaySprite";
import { Cell } from "../../types";
import { EventBus } from "../EventBus";
// import { Player } from "../player/Player";
// import { generateRoom } from "./roomGeneration";

const cellSize = 16;

export class RoomScene extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    r: PMath.RandomDataGenerator;
    cells: Cell[];
    map: Tilemaps.Tilemap;
    wallTiles: Tilemaps.Tileset | null;
    wallLayer: Tilemaps.TilemapLayer | null;
    floorTiles: Tilemaps.Tileset | null;
    floorLayer: Tilemaps.TilemapLayer | null;
    decalTiles: Tilemaps.Tileset | null;
    decalLayer: Tilemaps.TilemapLayer | null;
    focus: PMath.Vector2;
    player: Player;

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

        this.focus = new PMath.Vector2(400, 400);
        this.wallTiles = this.map.addTilesetImage(
            "walls_tilemap",
            "walls_tilemap",
            16,
            16
        );
        this.wallLayer = this.map.createBlankLayer(
            "walls",
            this.wallTiles!,
            0,
            0
        );
        this.wallLayer?.setDepth(1);
        this.floorTiles = this.map.addTilesetImage(
            "floor_tilemap",
            "floor_tilemap",
            16,
            16
        );
        this.floorLayer = this.map.createBlankLayer(
            "floor",
            this.floorTiles!,
            0,
            0
        );
        this.floorLayer?.setDepth(0);
        this.decalTiles = this.map.addTilesetImage(
            "ground_decal_tilemap",
            "ground_decal_tilemap",
            16,
            16
        );
        this.decalLayer = this.map.createBlankLayer(
            "ground_decals",
            this.decalTiles!,
            0,
            0
        );
        this.decalLayer?.setOrigin(0.5, 0.5);

        this.data.set("width", 800);
        this.data.set("height", 800);

        const { cells, rooms, exits } = generateMap({
            width: this.data.get("width"),
            height: this.data.get("height"),
            cellSize,
        });

        this.cells = cells;

        const mappedCells = new Map<string, Cell>();

        cells.forEach((c) =>
            mappedCells.set(`${c.position.x} - ${c.position.y}`, c)
        );

        new Array(this.data.get("height") + 1).fill("").map((_, y) =>
            new Array(this.data.get("width") + 1).fill("").map((_, x) => {
                const pos = new PMath.Vector2(x, y);
                const wallVector = getWallDisplaySprite({
                    pos,
                    cells: mappedCells,
                });

                if (wallVector) {
                    this.selectLayer(this.wallLayer!);
                    const wallFrame = wallVector.y * 4 + wallVector.x;
                    this.map.putTileAt(wallFrame, x, y);
                }
                const floorVector = getFloorDisplaySprite({
                    pos,
                    cells: mappedCells,
                });
                if (floorVector) {
                    this.selectLayer(this.floorLayer!);
                    const floorFrame = floorVector.y * 4 + floorVector.x;
                    this.map.putTileAt(floorFrame, x, y);
                }
                const dCell = mappedCells.get(`${x} - ${y}`);
                if (dCell?.isFloor && dCell.n > 0.5) {
                    this.selectLayer(this.decalLayer!);
                    const decalFrame = Math.floor(
                        mapValues(dCell.n, 0.5, 1, 0, 9)
                    );
                    this.map.putTileAt(decalFrame, x, y);
                }
            })
        );
    }

    create() {
        this.reset();
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(
            Phaser.Display.Color.ValueToColor(`#8a7366`).color32
        );
        this.camera.centerOn(this.data.get("width"), this.data.get("height"));
        this.camera.setZoom(1);

        const playerStart = [...this.cells]
            .filter((c) => c.isFloor)
            .sort(() => (Math.random() > 0.5 ? 1 : -1))[0];

        this.player = new Player(
            this,
            playerStart.position.x * cellSize,
            playerStart.position.y * cellSize
        );
        this.player.play("idle");

        this.camera.startFollow(this.player, true, 0.3, 0.3);

        this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
            if (
                !["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(
                    e.key
                )
            ) {
                return;
            }

            if (e.key === "ArrowRight") {
                this.player.setPosition(
                    this.player.x + cellSize,
                    this.player.y
                );
            }
            if (e.key === "ArrowLeft") {
                this.player.setPosition(
                    this.player.x - cellSize,
                    this.player.y
                );
            }
            if (e.key === "ArrowDown") {
                this.player.setPosition(
                    this.player.x,
                    this.player.y + cellSize
                );
            }
            if (e.key === "ArrowUp") {
                this.player.setPosition(
                    this.player.x,
                    this.player.y - cellSize
                );
            }
        });
        EventBus.emit("current-scene-ready", this);
    }

    update(time: number, delta: number): void {}
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

//         const wallFrame = spriteInfo.y * 4 + spriteInfo.x;
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
//                 wallFrame
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


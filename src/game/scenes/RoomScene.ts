import { Math as PMath, Scene, Tilemaps, Tweens } from "phaser";

import { Player } from "../../components/Player";
import { Tile } from "../../components/Tile";
import { generateMap, mapValues } from "../../scripts/generateMap";
import {
    getFloorDisplaySprite,
    getWallDisplaySprite,
} from "../../scripts/getDisplaySprite";
import { Cell } from "../../types";
import { EventBus } from "../EventBus";
import { cellSize } from "../../utils/constants";

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
    mappedCells: Map<string, Cell> = new Map();
    mappedTiles: Map<string, Tile> = new Map();
    floatTween: Tweens.Tween | undefined;
    floatingTiles: Tile[] = [];

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

        this.decalLayer?.setDepth(1);
        this.decalLayer?.setOrigin(0.5, 0.5);

        this.data.set("width", 800);
        this.data.set("height", 800);

        const { cells, rooms, exits } = generateMap({
            width: this.data.get("width"),
            height: this.data.get("height"),
            cellSize,
        });

        this.cells = cells;

        cells.forEach((c) =>
            this.mappedCells.set(`${c.position.x} - ${c.position.y}`, c)
        );

        new Array(this.data.get("height") + 1).fill("").map((_, y) =>
            new Array(this.data.get("width") + 1).fill("").map((_, x) => {
                const pos = new PMath.Vector2(x, y);
                const wallVector = getWallDisplaySprite({
                    pos,
                    cells: this.mappedCells,
                });

                if (wallVector) {
                    this.selectLayer(this.wallLayer!);
                    const wallFrame = wallVector.y * 4 + wallVector.x;
                    this.map.putTileAt(wallFrame, x - 1, y - 1);
                }
                const floorVector = getFloorDisplaySprite({
                    pos,
                    cells: this.mappedCells,
                });
                if (floorVector) {
                    this.selectLayer(this.floorLayer!);
                    const floorFrame = floorVector.y * 4 + floorVector.x;
                    this.map.putTileAt(floorFrame, x - 1, y - 1);
                }
                const dCell = this.mappedCells.get(`${x} - ${y}`);
                if (dCell?.isFloor && dCell.n > 0.5) {
                    this.selectLayer(this.decalLayer!);
                    const decalFrame = Math.floor(
                        mapValues(dCell.n, 0.5, 1, 0, 9)
                    );
                    this.map.putTileAt(decalFrame, x - 1, y - 1);
                }
            })
        );
        cells.forEach((c) => {
            if (c.isFloor && c.n < 0.33 && this.r.frac() > 0.33) {
                const t = new Tile(this, c).setDepth(4);
                this.floatingTiles.push(t);
                const delay = mapValues(c.n, 0, 1, 600, 800);
                t.buoyancy = delay;

                this.mappedTiles.set(`${c.position.x} - ${c.position.y}`, t);

                new Tweens.Tween(this.tweens, [this.player]);

                this.tweens.add({
                    targets: t,
                    displayOriginY: { from: 7, to: 9 },
                    ease: "Ease",
                    // easeParams: [4],
                    duration: t.buoyancy,
                    loop: -1,
                    delay: t.buoyancy,
                    hold: t.buoyancy / 2,
                    yoyo: true,
                });
            }
        });
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

        this.player = new Player(this, playerStart);

        this.player.idle();
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
                if (!this.player.isMoving) {
                    this.player.walkRight();

                    const target = new PMath.Vector2(
                        this.player.x + cellSize,
                        this.player.y
                    );

                    const targetCell = this.mappedCells.get(
                        `${target.x / cellSize} - ${target.y / cellSize}`
                    );

                    const canWalk = targetCell?.isFloor;

                    if (!canWalk) {
                        this.player.idle();
                        return;
                    }

                    this.player.target = target;
                    const targetTile = this.mappedTiles.get(
                        `${this.player.target.x / cellSize} - ${
                            this.player.target.y / cellSize
                        }`
                    );

                    this.tweens.add({
                        targets: this.player,
                        x: this.player.target.x,
                        y: this.player.target.y,
                        displayOriginY: targetTile
                            ? targetTile.displayOriginY + 8
                            : this.player.displayOriginY,
                        ease: "Stepped",
                        easeParams: [4],
                        duration: 400,
                        onStart: () => {
                            this.player.prev = "right";
                            this.player.isMoving = true;
                        },
                        onComplete: (tween) => {
                            this.floatTween?.stop();
                            this.player.isMoving = false;
                            this.player.currentCell = targetCell;
                            this.player.idle();
                            this.playerFloat(targetTile);
                            tween.remove();
                        },
                    });
                }
            }
            if (e.key === "ArrowLeft") {
                if (!this.player.isMoving) {
                    this.player.walkLeft();
                    const target = new PMath.Vector2(
                        this.player.x - cellSize,
                        this.player.y
                    );

                    const targetCell = this.mappedCells.get(
                        `${target.x / cellSize} - ${target.y / cellSize}`
                    );

                    const canWalk = targetCell?.isFloor;

                    if (!canWalk) {
                        console.log(targetCell);
                        this.player.idle();
                        return;
                    }

                    this.player.target = target;
                    const targetTile = this.mappedTiles.get(
                        `${this.player.target.x / cellSize} - ${
                            this.player.target.y / cellSize
                        }`
                    );
                    this.tweens.add({
                        targets: this.player,
                        x: this.player.target.x,
                        y: this.player.target.y,
                        displayOriginY: targetTile
                            ? targetTile.displayOriginY + 8
                            : this.player.displayOriginY,
                        ease: "Stepped",
                        easeParams: [4],
                        duration: 400,
                        onStart: () => {
                            this.player.prev = "left";
                            this.player.isMoving = true;
                        },
                        onComplete: (tween) => {
                            this.floatTween?.stop();
                            this.player.isMoving = false;
                            this.player.currentCell = targetCell;
                            this.player.idle();
                            this.playerFloat(targetTile);
                            tween.remove();
                        },
                    });
                }
            }
            if (e.key === "ArrowDown") {
                if (!this.player.isMoving) {
                    this.player.walkDown();
                    const target = new PMath.Vector2(
                        this.player.x,
                        this.player.y + cellSize
                    );
                    const targetCell = this.mappedCells.get(
                        `${target.x / cellSize} - ${target.y / cellSize}`
                    );

                    const canWalk = targetCell?.isFloor;

                    if (!canWalk) {
                        console.log(targetCell);
                        this.player.idle();
                        return;
                    }

                    this.player.target = target;
                    const targetTile = this.mappedTiles.get(
                        `${this.player.target.x / cellSize} - ${
                            this.player.target.y / cellSize
                        }`
                    );
                    this.tweens.add({
                        targets: this.player,
                        x: this.player.target.x,
                        y: this.player.target.y,
                        displayOriginY: targetTile
                            ? targetTile.displayOriginY + 8
                            : this.player.displayOriginY,
                        ease: "Stepped",
                        easeParams: [4],
                        duration: 400,
                        onStart: () => {
                            this.player.prev = "down";
                            this.player.isMoving = true;
                        },
                        onComplete: (tween) => {
                            this.floatTween?.stop();
                            this.player.isMoving = false;
                            this.player.currentCell = targetCell;
                            this.player.idle();
                            this.playerFloat(targetTile);

                            tween.remove();
                        },
                    });
                }
            }
            if (e.key === "ArrowUp") {
                if (!this.player.isMoving) {
                    this.player.walkUp();
                    const target = new PMath.Vector2(
                        this.player.x,
                        this.player.y - cellSize
                    );
                    const targetCell = this.mappedCells.get(
                        `${target.x / cellSize} - ${target.y / cellSize}`
                    );

                    const canWalk = targetCell?.isFloor;

                    if (!canWalk) {
                        console.log(targetCell);
                        this.player.idle();
                        return;
                    }

                    this.player.target = target;
                    const targetTile = this.mappedTiles.get(
                        `${this.player.target.x / cellSize} - ${
                            this.player.target.y / cellSize
                        }`
                    );

                    this.tweens.add({
                        targets: this.player,
                        x: this.player.target.x,
                        y: this.player.target.y,
                        displayOriginY: targetTile
                            ? targetTile.displayOriginY + 8
                            : this.player.displayOriginY,
                        ease: "Stepped",
                        easeParams: [4],
                        duration: 400,
                        onStart: () => {
                            this.player.prev = "up";
                            this.player.isMoving = true;
                        },
                        onComplete: (tween) => {
                            this.floatTween?.stop();
                            this.player.isMoving = false;
                            this.player.idle();
                            this.player.currentCell = targetCell;
                            this.playerFloat(targetTile);

                            tween.remove();
                        },
                    });
                }
            }
        });
        EventBus.emit("current-scene-ready", this);
    }

    playerFloat = (targetTile?: Tile) => {
        if (targetTile) {
            const tileTween = this.tweens
                .getTweens()
                .find((t) =>
                    t.targets.find((t) => {
                        if ("id" in t) {
                            return t.id === targetTile.id;
                        }
                    })
                )
                ?.seek(10);

            if (!tileTween) {
                return this.player.setDisplayOrigin(8, 12);
            }

            targetTile.setDisplayOrigin(8, 7);
            this.player.setDisplayOrigin(8, targetTile.displayOriginY + 8);

            this.floatTween = this.tweens.add({
                targets: this.player,
                displayOriginY: { from: 14, to: 16 },
                ease: "Stepped",
                easeParams: [4],
                duration: targetTile.buoyancy,
                loop: -1,
                delay: targetTile.buoyancy,
                hold: targetTile.buoyancy / 2,
                yoyo: true,
                persist: false,
                seek: tileTween.elapsed + 50,
            });
        } else {
            this.player.setDisplayOrigin(8, 12);
        }
    };

    update(time: number, delta: number): void {}
}


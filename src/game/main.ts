import { Game } from "phaser";
import { Boot } from "./scenes/Boot";

import { RoomScene } from "./scenes/RoomScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    fps: {
        limit: 30,
        target: 30,
        forceSetTimeOut: true,
    },
    scale: {
        mode: Phaser.Scale.NONE,
        zoom: 2,
        width: 256,
        height: 192,
        min: {
            width: 256,
            height: 192,
        },
        max: {
            width: 256 * 2,
            height: 192 * 2,
        },
    },
    type: Phaser.WEBGL,
    parent: "game-container",
    scene: [Boot],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;


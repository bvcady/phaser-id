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
        // autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 256,
        height: 192,
    },
    type: Phaser.WEBGL,
    width: 1200,
    parent: "game-container",
    scene: [Boot, RoomScene],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;


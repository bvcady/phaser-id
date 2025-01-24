import { Math as PMath } from "phaser";

export type Room = {
    position: PMath.Vector2;
    hasExit: boolean;
    type: string;
    radius: number;
};

export type Cell = {
    filled: boolean;
    position: PMath.Vector2;
    isWall?: boolean;
    isFloor?: boolean;
    isLava?: boolean;
    type: string;
    n: number;
};


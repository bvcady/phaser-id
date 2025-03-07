import { Math } from "phaser";
import { Cell } from "../types";

const A = "no";
const B = "yes";

const V = Math.Vector2;

export const displayTileOptions: Map<string, [Math.Vector2 | string]> =
    new Map()
        .set([A, A, B, A].toString(), [new V(0, 0), "OUTER_BOTTOM_LEFT"])
        .set([B, A, A, B].toString(), [new V(0, 1), "DUAL_DOWN_RIGHT"])
        .set([A, B, A, A].toString(), [new V(0, 2), "OUTER_TOP_RIGHT"])
        .set([A, A, A, A].toString(), [new V(0, 3), "EMPTY"])
        .set([A, B, A, B].toString(), [new V(1, 0), "EDGE_RIGHT"])
        .set([A, B, B, B].toString(), [new V(1, 1), "INNER_BOTTOM_RIGHT"])
        .set([B, B, A, A].toString(), [new V(1, 2), "EDGE_TOP"])
        .set([A, A, A, B].toString(), [new V(1, 3), "OUTER_BOTTOM_RIGHT"])
        .set([B, B, B, B].toString(), [new V(2, 1), "FULL"])
        .set([B, A, B, B].toString(), [new V(2, 0), "INNER_BOTTOM_LEFT"])
        .set([B, B, A, B].toString(), [new V(2, 2), "INNER_TOP_RIGHT"])
        .set([A, B, B, A].toString(), [new V(2, 3), "DUAL_UP_RIGHT"])
        .set([A, A, B, B].toString(), [new V(3, 0), "EDGE_BOTTOM"])
        .set([B, B, B, A].toString(), [new V(3, 1), "INNER_TOP_LEFT"])
        .set([B, A, B, A].toString(), [new V(3, 2), "EDGE_LEFT"])
        .set([B, A, A, A].toString(), [new V(3, 3), "OUTER_TOP_LEFT"]);

// console.log(displayTileOptions);

const neighbours = [new V(0, 0), new V(1, 0), new V(0, 1), new V(1, 1)];

interface Props {
    pos: Math.Vector2;
    cells: Map<string, Cell>;
    displayTiles?: Map<string, Math.Vector2 | undefined>;
    shouldlog?: boolean;
}

export const getWallDisplaySprite = ({ pos, cells, shouldlog }: Props) => {
    const getWorldTile = (coords: Math.Vector2): string => {
        const foundCell = cells.get(`${coords.x} - ${coords.y}`);
        if (!foundCell?.isWall && !foundCell?.isFloor) {
            return "yes";
        }
        if (foundCell.isFloor) {
            return "no";
        }
        return "yes";
    };
    pos.subtract({ x: 1, y: 1 });
    const bottomRight = getWorldTile(pos.clone().add(neighbours[3]));
    const bottomLeft = getWorldTile(pos.clone().add(neighbours[2]));
    const topRight = getWorldTile(pos.clone().add(neighbours[1]));
    const topLeft = getWorldTile(pos.clone().add(neighbours[0]));
    const key = [topLeft, topRight, bottomLeft, bottomRight].toString();
    if (
        topLeft === "no" &&
        topLeft === topRight &&
        topRight === bottomLeft &&
        bottomLeft === bottomRight
    ) {
        return undefined;
    }
    return displayTileOptions.get(key)?.[0] as Math.Vector2;
};

export const getFloorDisplaySprite = ({ pos, cells, shouldlog }: Props) => {
    const getWorldTile = (coords: Math.Vector2): string => {
        const foundCell = cells.get(`${coords.x} - ${coords.y}`);

        if (foundCell?.n < 0.5) {
            return "yes";
        }
        // if (foundCell?.isWall) {
        //     return "no";
        // }
        return "no";
    };

    pos.clone().subtract({ x: 1, y: 1 });

    const bottomRight = getWorldTile(pos.clone().add(neighbours[3]));
    const bottomLeft = getWorldTile(pos.clone().add(neighbours[2]));
    const topRight = getWorldTile(pos.clone().add(neighbours[1]));
    const topLeft = getWorldTile(pos.clone().add(neighbours[0]));
    const key = [topLeft, topRight, bottomLeft, bottomRight].toString();

    if (shouldlog) {
        console.log(pos);
        console.log(key);
        console.log(displayTileOptions.get(key));
    }

    // if (
    //     topLeft !== "no" &&
    //     topLeft === topRight &&
    //     topRight === bottomLeft &&
    //     bottomLeft === bottomRight
    // ) {
    //     return undefined;
    // }
    return displayTileOptions.get(key)?.[0] as Math.Vector2;
};


import { Cell } from "../types";

interface Props {
    cell: Cell;
    allCells: Cell[];
}

export const getSprite = ({ cell, allCells }: Props) => {
    if (cell.isWall) {
        const [top, bottom, left, right] = [
            allCells.find(
                (c) =>
                    c.isWall &&
                    c.position.x === cell.position.x &&
                    c.position.y === cell.position.y - 1
            ),
            allCells.find(
                (c) =>
                    c.isWall &&
                    c.position.x === cell.position.x &&
                    c.position.y === cell.position.y + 1
            ),
            allCells.find(
                (c) =>
                    c.isWall &&
                    c.position.x === cell.position.x - 1 &&
                    c.position.y === cell.position.y
            ),
            allCells.find(
                (c) =>
                    c.isWall &&
                    c.position.x === cell.position.x + 1 &&
                    c.position.y === cell.position.y
            ),
        ];

        if (top && bottom && left && right) {
            console.log("enclosed");
        } else if (top && bottom && left) {
            console.log("left enclosed");
        } else if (top && bottom && right) {
            console.log("right enclosed");
        } else if (top && left && right) {
            console.log("top enclosed");
        } else if (bottom && left && right) {
            console.log("bottom enclosed");
        } else if (bottom && left) {
            console.log("top right corner");
        } else if (bottom && right) {
            console.log("top left corner");
        } else if (top && left) {
            console.log("bottom right corner");
        } else if (top && right) {
            console.log("bottom left corner");
        } else if (top && bottom) {
            console.log("vertical");
        } else if (left && right) {
            console.log("horizontal");
        } else {
            console.log("solo");
        }
    }
};


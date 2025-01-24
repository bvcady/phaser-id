import { Math as PMath } from "phaser";
import { createNoise2D } from "simplex-noise";
import { Cell, Room } from "../types";

interface Props {
    width: number;
    height: number;
    cellSize: number;
}

const constrain = (num: number, min: number, max: number) =>
    Math.min(Math.max(num, min), max);

const randDataGen = new PMath.RandomDataGenerator([
    Math.random().toString(36).substring(4).toLocaleUpperCase(),
]);

const noise2D = createNoise2D(() => randDataGen.frac());
const noise = (x: number, y: number) => (1 + noise2D(x, y)) / 2;

const random = (min: number, max: number) =>
    min + randDataGen.frac() * (max - min);

const mapValues = (
    value: number,
    fromMin: number,
    fromMax: number,
    toMin: number,
    toMax: number
) => {
    const d = (toMax - toMin) / (fromMax - fromMin);
    return (value - fromMin) * d + toMin;
};

const roomTypes = [""];

export const generateMap = ({ width, height, cellSize }: Props) => {
    // const [minN, maxN] = [0, 0]

    const rooms = [] as Room[];
    let cells = [] as Cell[];
    const exits = [] as Cell[];

    const w = Math.floor(width / cellSize) - 4;
    const h = Math.floor(height / cellSize) - 4;

    const nRooms = 10;

    const baseR = (width < height ? width : height) / 8;

    let nAttempts = 0;

    while (rooms.length < nRooms && nAttempts < 1000) {
        if (!rooms.length) {
            const radius = baseR;

            const x =
                Math.floor(
                    constrain(
                        random(0, width),
                        radius * 3,
                        width - radius * 3
                    ) / cellSize
                ) * cellSize;
            const y =
                Math.floor(
                    constrain(
                        random(0, height),
                        radius * 3,
                        height - radius * 3
                    ) / cellSize
                ) * cellSize;

            const newRoom = {
                position: new PMath.Vector2(x, y),
                radius,
                type: "base",
                hasExit: false,
            };

            rooms.push(newRoom);
            nAttempts++;
        } else {
            const previous = Math.floor(random(0, rooms.length - 1));

            const randAngle = random(0, Math.PI * 2);

            const radius =
                mapValues(
                    rooms.length - 2,
                    0,
                    nRooms,
                    baseR * 0.8,
                    baseR * 0.1
                ) * random(0.8, 1.5);

            const v = new PMath.Vector2(0, rooms[previous].radius + radius);
            v.setAngle(randAngle);
            v.add(rooms[previous].position);

            let tooClose = false;

            const checkDistancesFromOtherRooms = () => {
                [...rooms].forEach((room, index) => {
                    if (tooClose) {
                        return;
                    }

                    const tooCloseToExisting =
                        v.distance(room.position) < room.radius * 2.25;

                    const tooCloseToEdge =
                        v.x > width - radius * 3 ||
                        v.x < radius * 3 ||
                        v.y > height - radius * 3 ||
                        v.y < radius * 3;

                    tooClose =
                        (index !== previous && tooCloseToExisting) ||
                        tooCloseToEdge;
                });
            };

            checkDistancesFromOtherRooms();

            const hasExit = random(0, 10) < 2;

            if (!tooClose) {
                const newRoom = {
                    position: v,
                    radius,
                    type: hasExit
                        ? "exit"
                        : [...roomTypes].sort(() =>
                              random(0, 1) < 0.5 ? 1 : 0
                          )[0],
                    hasExit,
                };

                rooms.push(newRoom);
            }

            nAttempts++;
        }
    }

    const checkFloor = (vec: PMath.Vector2, n: number) => {
        let close = false;
        let type = "base";

        const copyV = vec.clone().multiply({ x: cellSize, y: cellSize });

        rooms.forEach((room) => {
            if (close) {
                return close;
            }

            const distanceFromCenterOfRoom = copyV.distance(room.position);

            const distortion = 80;

            const radNoise = mapValues(
                noise(
                    mapValues(vec.x, 0, width, 0, distortion),
                    mapValues(vec.y, 0, height, 0, distortion)
                ),
                0,
                1,
                -0.1,
                0.2
            );

            if (
                distanceFromCenterOfRoom <=
                room.radius * 1.25 + radNoise * room.radius
            ) {
                close = true;
                type = room.type;
            }
        });

        return { close, type };
    };

    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            const position = new PMath.Vector2(i, j);

            const n = noise(
                mapValues(i * cellSize, 0, width, 0, 3),
                mapValues(j * cellSize, 0, height, 0, 3)
            );
            const roomInfo = checkFloor(position, n);

            cells.push({
                position,
                filled: false,
                isFloor: roomInfo.close,
                isWall: false,
                isLava: false,
                type: roomInfo.type,
                n,
            });
        }
    }

    const getNeighbours = (c: Cell, key: keyof Cell, d: number) => {
        return cells.some(
            (cell) => cell[key] && cell.position.distance(c.position) <= d
        );
    };

    cells = [...cells].map((c) => {
        return {
            ...c,
            isWall: !c.isFloor && getNeighbours(c, "isFloor", 2.5),
        };
    });

    cells = [...cells].map((c) => {
        return {
            ...c,
            isLava:
                (c.isFloor && getNeighbours(c, "isWall", 2 + c.n)) ||
                (c.isFloor && (c.n < 0.33 || c.n > 0.66)),
        };
    });

    cells = [...cells].map((c) => {
        return {
            ...c,
            filled: c.isLava || c.isFloor || c.isWall || false,
        };
    });

    rooms.forEach((room) => {
        if (room.hasExit) {
            const exit = cells
                .filter(
                    (cell) =>
                        cell.position
                            .clone()
                            .multiply({ x: cellSize, y: cellSize })
                            .distance(room.position) <
                        room.radius / 2
                )
                .sort(() => 0.5 - random(0, 1))[0];
            exits.push(exit);
        }
    });

    return {
        exits,
        cells,
        rooms,
    };
};


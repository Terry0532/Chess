import Piece from './piece.js';

export default class Rook extends Piece {
    constructor(player) {
        super(player, (player === 1 ? "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg" : "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg"));
        this.name = "Rook";
    }

    isMovePossible(src, dest) {
        let mod = src % 8;
        let diff = 8 - mod;

        return (Math.abs(src - dest) % 8 === 0 || (dest >= (src - mod) && dest < (src + diff)));
    }

    possibleMoves(src, squares) {
        const highLightMoves = [];
        let up = true;
        let down = true;
        let left = true;
        let right = true;
        let temp = src;
        let temp2 = src;
        let temp3 = src;
        let temp4 = src;
        while (up) {
            if (temp - 8 > -1) {
                if (squares[temp - 8] === null) {
                    highLightMoves.push((temp - 8));
                    temp = temp - 8;
                } else if (squares[temp - 8].player === 2 && this.player === 1) {
                    highLightMoves.push((temp - 8));
                    temp = temp - 8;
                    up = false;
                } else if (squares[temp - 8].player === 1 && this.player === 2) {
                    highLightMoves.push((temp - 8));
                    temp = temp - 8;
                    up = false;
                } else {
                    up = false
                }
            } else {
                up = false;
            }
        }
        while (down) {
            if (temp2 + 8 < 64) {
                if (squares[temp2 + 8] === null) {
                    highLightMoves.push((temp2 + 8));
                    temp2 = temp2 + 8;
                } else if (squares[temp2 + 8].player === 2 && this.player === 1) {
                    highLightMoves.push((temp2 + 8));
                    temp2 = temp2 + 8;
                    down = false;
                } else if (squares[temp2 + 8].player === 1 && this.player === 2) {
                    highLightMoves.push((temp2 + 8));
                    temp2 = temp2 + 8;
                    down = false;
                } else {
                    down = false
                }
            } else {
                down = false;
            }
        }
        while (left) {
            if (temp3 % 8 === 0) {
                left = false;
            } else {
                if (squares[temp3 - 1] === null) {
                    highLightMoves.push((temp3 - 1));
                    temp3 = temp3 - 1;
                } else if (squares[temp3 - 1].player === 2 && this.player === 1) {
                    highLightMoves.push((temp3 - 1));
                    temp3 = temp3 - 1;
                    left = false;
                } else if (squares[temp3 - 1].player === 1 && this.player === 2) {
                    highLightMoves.push((temp3 - 1));
                    temp3 = temp3 - 1;
                    left = false;
                } else {
                    left = false;
                }
            }
        }
        while (right) {
            if ((temp4 + 1) % 8 === 0) {
                right = false;
            } else {
                if (squares[temp4 + 1] === null) {
                    highLightMoves.push((temp4 + 1));
                    temp4 = temp4 + 1;
                } else if (squares[temp4 + 1].player === 2 && this.player === 1) {
                    highLightMoves.push((temp4 + 1));
                    temp4 = temp4 + 1;
                    right = false;
                } else if (squares[temp4 + 1].player === 1 && this.player === 2) {
                    highLightMoves.push((temp4 + 1));
                    temp4 = temp4 + 1;
                    right = false;
                } else {
                    right = false;
                }
            }
        }
        return highLightMoves;
    }

    getSrcToDestPath(src, dest) {
        let path = [], pathStart, pathEnd, incrementBy;
        if (src > dest) {
            pathStart = dest;
            pathEnd = src;
        }
        else {
            pathStart = src;
            pathEnd = dest;
        }
        if (Math.abs(src - dest) % 8 === 0) {
            incrementBy = 8;
            pathStart += 8;
        }
        else {
            incrementBy = 1;
            pathStart += 1;
        }

        for (let i = pathStart; i < pathEnd; i += incrementBy) {
            path.push(i);
        }
        return path;
    }
}
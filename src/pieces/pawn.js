import Piece from './piece.js';

export default class Pawn extends Piece {
    constructor(player) {
        super(player, (player === 1 ? "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg" : "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"));
        this.initialPositions = {
            1: [48, 49, 50, 51, 52, 53, 54, 55],
            2: [8, 9, 10, 11, 12, 13, 14, 15]
        }
        this.name = "Pawn"
    }

    isMovePossible(src, dest, isDestEnemyOccupied, enpassant, enpassantPosition) {
        console.log(enpassantPosition)
        if (this.player === 1) {
            if ((dest === src - 8 && !isDestEnemyOccupied) || (dest === src - 16 && this.initialPositions[1].indexOf(src) !== -1 && !isDestEnemyOccupied)) {
                return true;
            }
            else if (isDestEnemyOccupied && (dest === src - 9 || dest === src - 7)) {
                return true;
            }
            else if (enpassant && !isDestEnemyOccupied && enpassantPosition - 8 === dest) {
                return true;
            }
        }
        else if (this.player === 2) {
            if ((dest === src + 8 && !isDestEnemyOccupied) || (dest === src + 16 && this.initialPositions[2].indexOf(src) !== -1 && !isDestEnemyOccupied)) {
                return true;
            }
            else if (isDestEnemyOccupied && (dest === src + 9 || dest === src + 7)) {
                return true;
            }
            else if (enpassant && !isDestEnemyOccupied && enpassantPosition + 8 === dest) {
                return true;
            }
        }
        return false;
    }

    // possibleMoves(src, squares) {
    //     const highLightMoves = [];
    //     if (this.player === 1) {
    //         highLightMoves.push((src - 8));
    //         highLightMoves.push((src - 16));
    //         return highLightMoves;
    //     } else {
    //         highLightMoves.push((src + 8));
    //         highLightMoves.push((src + 16));
    //         return highLightMoves;
    //     }
    // }

    /**
     * returns array of one if pawn moves two steps, else returns empty array  
     * @param  {[type]} src  [description]
     * @param  {[type]} dest [description]
     * @return {[type]}      [description]
     */
    getSrcToDestPath(src, dest) {
        if (dest === src - 16) {
            return [src - 8];
        }
        else if (dest === src + 16) {
            return [src + 8];
        }
        return [];
    }
}
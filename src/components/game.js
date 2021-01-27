/* eslint-disable no-unused-expressions */
import React from 'react';
import '../index.css';
import Board from './board.js';
import FallenSoldierBlock from './fallensoldiers';
import initialiseChessBoard from '../helpers/initialiseChessBoard';

export default class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            squares: initialiseChessBoard(),
            whiteFallenSoldiers: [],
            blackFallenSoldiers: [],
            player: 1,
            sourceSelection: -1,
            status: '',
            turn: 'white',
            lastTurnPawnPosition: undefined,

            //true === last turn enemy's pawn moved for the first time and it moved 2 squares forward. for en pasaant
            firstMove: undefined,

            highLightMoves: [],

            //for castle
            allPossibleMovesWhite: [],
            allPossibleMovesBlack: [],
            whiteKingFirstMove: true,
            blackKingFirstMove: true,
            whiteRookFirstMoveLeft: true,
            whiteRookFirstMoveRight: true,
            blackRookFirstMoveLeft: true,
            blackRookFirstMoveRight: true
        }
    }

    handleClick(i) {
        let squares = this.state.squares;

        if (this.state.sourceSelection === -1) {
            let temp = [];
            if (!squares[i] || squares[i].player !== this.state.player) {
                this.setState({ status: "Wrong selection. Choose player " + this.state.player + " pieces." });
                squares[i] ? squares[i].style = { ...squares[i].style, backgroundColor: "" } : null;
            } else {
                //highlight selected piece
                squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html

                //check if castle is possible
                if (i === 4 || i === 60) {
                    if (this.state.turn === "white" && this.state.whiteKingFirstMove) {
                        if (
                            this.state.whiteRookFirstMoveLeft &&
                            squares[57] === null &&
                            squares[58] === null &&
                            squares[59] === null &&
                            !this.state.allPossibleMovesBlack.some(element => [57, 58, 59].includes(element))
                        ) {
                            temp.push(58);
                        }
                        if (
                            this.state.whiteRookFirstMoveRight &&
                            squares[61] === null &&
                            squares[62] === null &&
                            !this.state.allPossibleMovesBlack.some(element => [61, 62].includes(element))
                        ) {
                            temp.push(62);
                        }
                    } else if (this.state.blackKingFirstMove) {
                        if (
                            this.state.blackRookFirstMoveLeft &&
                            squares[1] === null &&
                            squares[2] === null &&
                            squares[3] === null &&
                            !this.state.allPossibleMovesWhite.some(element => [1, 2, 3].includes(element))
                        ) {
                            temp.push(2);
                        }
                        if (
                            this.state.blackRookFirstMoveRight &&
                            squares[5] === null &&
                            squares[6] === null &&
                            !this.state.allPossibleMovesWhite.some(element => [5, 6].includes(element))
                        ) {
                            temp.push(6);
                        }
                    }
                }

                //highlight possible moves
                if (squares[i].name === "Pawn") {
                    const enpassant = this.enpassant(i);
                    temp = temp.concat(squares[i].possibleMoves(i, squares, enpassant, this.state.lastTurnPawnPosition));
                } else if (squares[i].name === "King") {
                    temp = temp.concat(squares[i].possibleMoves(i, squares));
                    //make sure player don't move king into opponent's piece's square
                    let temp2 = [];
                    if (
                        (squares[i].player === 1 && this.state.allPossibleMovesBlack.some(element => temp.includes(element))) ||
                        (squares[i].player === 2 && this.state.allPossibleMovesWhite.some(element => temp.includes(element)))
                    ) {
                        let allPossibleMoves = this.state.player === 1 ? this.state.allPossibleMovesBlack : this.state.allPossibleMovesWhite;
                        for (let i = 0; i < temp.length; i++) {
                            let counter = 0;
                            for (let x = 0; x < allPossibleMoves.length; x++) {
                                if (temp[i] !== allPossibleMoves[x]) {
                                    counter++;
                                }
                            }
                            if (counter === allPossibleMoves.length) {
                                temp2.push(temp[i]);
                            }
                        }
                        temp = temp2;
                    }

                } else {
                    temp = temp.concat(squares[i].possibleMoves(i, squares));
                }
                for (let index = 0; index < temp.length; index++) {
                    const element = temp[index];
                    if (squares[element] !== null) {
                        squares[element].style = { ...squares[element].style, backgroundColor: "RGB(111,143,114)" };
                    } else {
                        squares.splice(element, 1, { style: { backgroundColor: "RGB(111,143,114)" } });
                    }
                }

                this.setState({
                    squares: squares,
                    status: "Choose destination for the selected piece",
                    sourceSelection: i,
                    highLightMoves: temp
                });
            }
        } else if (this.state.sourceSelection > -1) {
            //dehighlight selected piece
            squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };

            const whiteFallenSoldiers = this.state.whiteFallenSoldiers;
            const blackFallenSoldiers = this.state.blackFallenSoldiers;

            if (squares[this.state.sourceSelection].name === "Pawn") {
                squares = this.dehighlight(squares);
                const enpassant = this.enpassant(this.state.sourceSelection);

                if (this.state.highLightMoves.includes(i)) {
                    //if en passant is available and player decided to use it, else proceed without it
                    if (enpassant && squares[i] == null && (this.state.lastTurnPawnPosition - 8 === i || this.state.lastTurnPawnPosition + 8 === i)) {

                        //remove captured piece border color and add it to fallen soldier list
                        if (squares[this.state.lastTurnPawnPosition].player === 1) {
                            squares[this.state.lastTurnPawnPosition].style = { ...squares[this.state.lastTurnPawnPosition].style, borderColor: "transparent" };
                            whiteFallenSoldiers.push(squares[this.state.lastTurnPawnPosition]);
                        }
                        else {
                            squares[this.state.lastTurnPawnPosition].style = { ...squares[this.state.lastTurnPawnPosition].style, borderColor: "transparent" };
                            blackFallenSoldiers.push(squares[this.state.lastTurnPawnPosition]);
                        }

                        //move player selected piece to target position
                        squares[i] = squares[this.state.sourceSelection];
                        squares[this.state.lastTurnPawnPosition] = null;
                        squares[this.state.sourceSelection] = null;

                        //update the possible moves in order to check if next player can castle or not
                        const allPossibleMovesWhite = this.allPossibleMovesWhite(squares);
                        const allPossibleMovesBlack = this.allPossibleMovesBlack(squares);

                        this.changeTurn();
                        this.setState({
                            sourceSelection: -1,
                            squares: squares,
                            whiteFallenSoldiers: whiteFallenSoldiers,
                            blackFallenSoldiers: blackFallenSoldiers,
                            status: '',
                            highLightMoves: [],
                            allPossibleMovesWhite: allPossibleMovesWhite,
                            allPossibleMovesBlack: allPossibleMovesBlack
                        });
                    } else {
                        //check if current pawn is moving for the first time and moving 2 squares forward
                        let firstMove;
                        if (squares[this.state.sourceSelection].name === "Pawn") {
                            if (squares[this.state.sourceSelection].player === 1 && i === this.state.sourceSelection - 16) {
                                firstMove = true;
                            } else if (squares[this.state.sourceSelection].player === 2 && i === this.state.sourceSelection + 16) {
                                firstMove = true;
                            }
                        }

                        //record current pawn position for next turn to check en passant rule
                        let lastTurnPawnPosition = i;

                        this.addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        this.changeTurn();

                        //update the possible moves in order to check if next player can castle or not
                        const allPossibleMovesWhite = this.allPossibleMovesWhite(squares);
                        const allPossibleMovesBlack = this.allPossibleMovesBlack(squares);

                        this.setState({
                            sourceSelection: -1,
                            squares: squares,
                            status: '',
                            firstMove: firstMove,
                            lastTurnPawnPosition: lastTurnPawnPosition,
                            highLightMoves: [],
                            allPossibleMovesWhite: allPossibleMovesWhite,
                            allPossibleMovesBlack: allPossibleMovesBlack
                        });
                    }
                } else {
                    this.wrongMove(squares, "Wrong selection. Choose valid source and destination again.")
                }
            } else if (squares[this.state.sourceSelection].name === "King") {
                squares = this.dehighlight(squares);
                //castling
                if (this.state.highLightMoves.includes(i) && (i === 2 || i === 6 || i === 58 || i === 62)) {
                    if (i === 58) {
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        squares = this.movePiece(59, squares, 56);
                    }
                    if (i === 62) {
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        squares = this.movePiece(61, squares, 63);
                    }
                    if (i === 2) {
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        squares = this.movePiece(3, squares, 0);
                    }
                    if (i === 6) {
                        squares = this.movePiece(i, squares, this.state.sourceSelection);
                        squares = this.movePiece(5, squares, 7);
                    }
                    this.changeTurn();

                    this.setState({
                        sourceSelection: -1,
                        squares: squares,
                        status: '',
                        highLightMoves: []
                    });
                } else if (this.state.highLightMoves.includes(i)) {
                    this.addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
                    squares = this.movePiece(i, squares, this.state.sourceSelection);
                    this.changeTurn();

                    //to record king has been moved or not. for castle
                    let whiteKingFirstMove = this.state.whiteKingFirstMove;
                    let blackKingFirstMove = this.state.blackKingFirstMove;
                    if (squares[i].name === "King" && this.state.sourceSelection === 60 && squares[i].player === 1) {
                        whiteKingFirstMove = false;
                    }
                    if (squares[i].name === "King" && this.state.sourceSelection === 4 && squares[i].player === 2) {
                        blackKingFirstMove = false;
                    }

                    this.setState({
                        sourceSelection: -1,
                        squares: squares,
                        status: '',
                        highLightMoves: [],
                        whiteKingFirstMove: whiteKingFirstMove,
                        blackKingFirstMove: blackKingFirstMove
                    });
                } else {
                    this.wrongMove(squares, "Wrong selection. Choose valid source and destination again.")
                }
            } else {
                squares = this.dehighlight(squares);
                if (this.state.highLightMoves.includes(i)) {
                    this.addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers);
                    squares = this.movePiece(i, squares, this.state.sourceSelection);
                    this.changeTurn();

                    //to record if rook has been moved or not. for castle.
                    let whiteRookFirstMoveLeft = this.state.whiteRookFirstMoveLeft;
                    let whiteRookFirstMoveRight = this.state.whiteRookFirstMoveRight;
                    let blackRookFirstMoveLeft = this.state.blackRookFirstMoveLeft;
                    let blackRookFirstMoveRight = this.state.blackRookFirstMoveRight;
                    if (squares[i].name === "Rook" && this.state.sourceSelection === 56 && squares[i].player === 1) {
                        whiteRookFirstMoveLeft = false;
                    }
                    if (squares[i].name === "Rook" && this.state.sourceSelection === 63 && squares[i].player === 1) {
                        whiteRookFirstMoveRight = false;
                    }
                    if (squares[i].name === "Rook" && this.state.sourceSelection === 0 && squares[i].player === 2) {
                        blackRookFirstMoveLeft = false;
                    }
                    if (squares[i].name === "Rook" && this.state.sourceSelection === 7 && squares[i].player === 2) {
                        blackRookFirstMoveRight = false;
                    }

                    //update the possible moves in order to check if next player can castle or not
                    const allPossibleMovesWhite = this.allPossibleMovesWhite(squares);
                    const allPossibleMovesBlack = this.allPossibleMovesBlack(squares);

                    this.setState({
                        sourceSelection: -1,
                        squares: squares,
                        status: '',
                        highLightMoves: [],
                        whiteRookFirstMoveLeft: whiteRookFirstMoveLeft,
                        whiteRookFirstMoveRight: whiteRookFirstMoveRight,
                        blackRookFirstMoveLeft: blackRookFirstMoveLeft,
                        blackRookFirstMoveRight: blackRookFirstMoveRight,
                        allPossibleMovesWhite: allPossibleMovesWhite,
                        allPossibleMovesBlack: allPossibleMovesBlack
                    });
                } else {
                    this.wrongMove(squares, "Wrong selection. Choose valid source and destination again.")
                }
            }
        }
    }

    //to determine if its possible to do en passant capture
    enpassant(selectedPawnPosition) {
        let enpassant = false;
        if (selectedPawnPosition - 1 === this.state.lastTurnPawnPosition || selectedPawnPosition + 1 === this.state.lastTurnPawnPosition) {
            if (this.state.firstMove) {
                enpassant = true;
            }
        }
        return enpassant;
    }

    //dehighlight possible moves
    dehighlight(squares) {
        for (let index = 0; index < this.state.highLightMoves.length; index++) {
            const element = this.state.highLightMoves[index];
            if (squares[element].name === "Pawn" || squares[element].name === "Knight" || squares[element].name === "Rook" || squares[element].name === "Bishop" || squares[element].name === "Queen" || squares[element].name === "King") {
                squares[element].style = { ...squares[element].style, backgroundColor: "" };
            } else {
                squares[element] = null;
            }
        }
        return squares;
    }

    //remove captured piece border color and add it to fallen soldier list
    addToFallenSoldierList(i, squares, whiteFallenSoldiers, blackFallenSoldiers) {
        if (squares[i] !== null) {
            if (squares[i].player === 1) {
                squares[i].style = { ...squares[i].style, borderColor: "transparent" };
                whiteFallenSoldiers.push(squares[i]);
            }
            else {
                squares[i].style = { ...squares[i].style, borderColor: "transparent" };
                blackFallenSoldiers.push(squares[i]);
            }
        }
        this.setState({
            whiteFallenSoldiers: whiteFallenSoldiers,
            blackFallenSoldiers: blackFallenSoldiers
        })
    }

    //move player selected piece to target position
    movePiece(i, squares, sourceSelection) {
        squares[i] = squares[sourceSelection];
        squares[sourceSelection] = null;
        return squares;
    }

    changeTurn() {
        let player = this.state.player === 1 ? 2 : 1;
        let turn = this.state.turn === 'white' ? 'black' : 'white';
        this.setState({
            player: player,
            turn: turn
        })
    }

    //display message, and reset chess board
    wrongMove(squares, status) {
        this.setState({
            status: status,
            sourceSelection: -1,
            highLightMoves: [],
            squares: squares
        });
    }

    //give it the current chess board and return the possible moves
    allPossibleMovesWhite(squares) {
        const allPossibleMovesWhite = [];
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== null) {
                if (squares[i].player === 1) {
                    if (squares[i].name === "Pawn") {
                        let tempArray = squares[i].possibleCaptureMoves(i, squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            allPossibleMovesWhite.push(tempArray[i]);
                        }
                    } else {
                        let tempArray = squares[i].possibleMoves(i, squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            allPossibleMovesWhite.push(tempArray[i]);
                        }
                    }
                }
            }
        }
        allPossibleMovesWhite.sort();
        const temp = [];
        for (let i = 0; i < allPossibleMovesWhite.length; i++) {
            if (allPossibleMovesWhite[i] !== allPossibleMovesWhite[i + 1]) {
                temp.push(allPossibleMovesWhite[i]);
            }
        }
        return temp;
    }
    allPossibleMovesBlack(squares) {
        const allPossibleMovesBlack = [];
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== null) {
                if (squares[i].player === 2) {
                    if (squares[i].name === "Pawn") {
                        let tempArray = squares[i].possibleCaptureMoves(i, squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            allPossibleMovesBlack.push(tempArray[i]);
                        }
                    } else {
                        let tempArray = squares[i].possibleMoves(i, squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            allPossibleMovesBlack.push(tempArray[i]);
                        }
                    }
                }
            }
        }
        allPossibleMovesBlack.sort();
        const temp = [];
        for (let i = 0; i < allPossibleMovesBlack.length; i++) {
            if (allPossibleMovesBlack[i] !== allPossibleMovesBlack[i + 1]) {
                temp.push(allPossibleMovesBlack[i]);
            }
        }
        return temp;
    }

    render() {
        return (
            <div>
                <div className="game">
                    <div className="game-board">
                        <Board
                            squares={this.state.squares}
                            onClick={(i) => this.handleClick(i)}
                        />
                    </div>
                    <div className="game-info">
                        <h3>Turn</h3>
                        <div id="player-turn-box" style={{ backgroundColor: this.state.turn }}>

                        </div>
                        <div className="game-status">{this.state.status}</div>

                        <div className="fallen-soldier-block">

                            {<FallenSoldierBlock
                                whiteFallenSoldiers={this.state.whiteFallenSoldiers}
                                blackFallenSoldiers={this.state.blackFallenSoldiers}
                            />
                            }
                        </div>

                    </div>
                </div>

                <div className="icons-attribution">
                    <div> <small> Chess Icons And Favicon (extracted) By en:User:Cburnett [<a href="http://www.gnu.org/copyleft/fdl.html">GFDL</a>, <a href="http://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA-3.0</a>, <a href="http://opensource.org/licenses/bsd-license.php">BSD</a> or <a href="http://www.gnu.org/licenses/gpl.html">GPL</a>], <a href="https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces">via Wikimedia Commons</a> </small></div>
                </div>
            </div>
        );
    }
}
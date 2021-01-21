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
            //pawn's first move and it moved 2 squares forward
            firstMove: undefined,
            highLightMoves: [],
            allPossibleMovesWhite: [],
            allPossibleMovesBlack: [],
            kingFirstMove: true,
            rookFirstMove: true
        }
    }

    handleClick(i) {
        console.log(this.state.rookFirstMove)
        let squares = this.state.squares;
        const highLightMoves = this.state.highLightMoves;

        for (let i = 0; i < this.state.squares.length; i++) {
            if (this.state.squares[i] !== null) {
                if (this.state.squares[i].player === 1) {
                    if (this.state.squares[i].name === "Pawn") {
                        let tempArray = this.state.squares[i].possibleCaptureMoves(i, this.state.squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            this.state.allPossibleMovesWhite.push(tempArray[i]);
                        }
                    } else {
                        let tempArray = this.state.squares[i].possibleMoves(i, this.state.squares);
                        for (let i = 0; i < tempArray.length; i++) {
                            this.state.allPossibleMovesWhite.push(tempArray[i]);
                        }
                    }
                }
            }
        }
        console.log(this.state.allPossibleMovesWhite.sort());

        if (this.state.sourceSelection === -1) {
            if (!squares[i] || squares[i].player !== this.state.player) {
                this.setState({ status: "Wrong selection. Choose player " + this.state.player + " pieces." });
                squares[i] ? squares[i].style = { ...squares[i].style, backgroundColor: "" } : null;
            } else {
                //highlight selected piece
                squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html

                //highlight possible moves
                let temp;
                if (squares[i].name === "Pawn") {
                    const enpassant = this.enpassant(i);
                    temp = squares[i].possibleMoves(i, squares, enpassant, this.state.lastTurnPawnPosition);
                } else {
                    temp = squares[i].possibleMoves(i, squares);
                }
                for (let index = 0; index < temp.length; index++) {
                    const element = temp[index];
                    highLightMoves.push(element);
                }
                for (let index = 0; index < highLightMoves.length; index++) {
                    const element = highLightMoves[index];
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
                    highLightMoves: highLightMoves
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
                        if (squares[this.state.lastTurnPawnPosition].player === 1) {
                            squares[this.state.lastTurnPawnPosition].style = { ...squares[this.state.lastTurnPawnPosition].style, borderColor: "transparent" };
                            whiteFallenSoldiers.push(squares[this.state.lastTurnPawnPosition]);
                        }
                        else {
                            squares[this.state.lastTurnPawnPosition].style = { ...squares[this.state.lastTurnPawnPosition].style, borderColor: "transparent" };
                            blackFallenSoldiers.push(squares[this.state.lastTurnPawnPosition]);
                        }
                        squares[i] = squares[this.state.sourceSelection];
                        squares[this.state.lastTurnPawnPosition] = null;
                        squares[this.state.sourceSelection] = null;
                        let player = this.state.player === 1 ? 2 : 1;
                        let turn = this.state.turn === 'white' ? 'black' : 'white';
                        this.setState({
                            sourceSelection: -1,
                            squares: squares,
                            whiteFallenSoldiers: whiteFallenSoldiers,
                            blackFallenSoldiers: blackFallenSoldiers,
                            player: player,
                            status: '',
                            turn: turn,
                            highLightMoves: []
                        });
                    } else {
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

                        squares[i] = squares[this.state.sourceSelection];
                        squares[this.state.sourceSelection] = null;
                        let player = this.state.player === 1 ? 2 : 1;
                        let turn = this.state.turn === 'white' ? 'black' : 'white';
                        this.setState({
                            sourceSelection: -1,
                            squares: squares,
                            whiteFallenSoldiers: whiteFallenSoldiers,
                            blackFallenSoldiers: blackFallenSoldiers,
                            player: player,
                            status: '',
                            turn: turn,
                            firstMove: firstMove,
                            lastTurnPawnPosition: lastTurnPawnPosition,
                            highLightMoves: []
                        });
                    }
                } else {
                    this.setState({
                        status: "Wrong selection. Choose valid source and destination again.",
                        sourceSelection: -1,
                        squares: squares,
                        highLightMoves: []
                    });
                }
            } else if (squares[this.state.sourceSelection].name === "King") {
                squares = this.dehighlight(squares);
                if (this.state.highLightMoves.includes(i)) {
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
                    squares[i] = squares[this.state.sourceSelection];
                    squares[this.state.sourceSelection] = null;
                    let player = this.state.player === 1 ? 2 : 1;
                    let turn = this.state.turn === 'white' ? 'black' : 'white';
                    this.setState({
                        sourceSelection: -1,
                        squares: squares,
                        whiteFallenSoldiers: whiteFallenSoldiers,
                        blackFallenSoldiers: blackFallenSoldiers,
                        player: player,
                        status: '',
                        turn: turn,
                        highLightMoves: []
                    });
                } else {
                    this.setState({
                        status: "Wrong selection. Choose valid source and destination again.",
                        sourceSelection: -1,
                        highLightMoves: [],
                        squares: squares
                    });
                }
            } else {
                squares = this.dehighlight(squares);
                if (this.state.highLightMoves.includes(i)) {
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
                    squares[i] = squares[this.state.sourceSelection];
                    squares[this.state.sourceSelection] = null;
                    let player = this.state.player === 1 ? 2 : 1;
                    let turn = this.state.turn === 'white' ? 'black' : 'white';

                    let rookFirstMove;
                    if (squares[i].name === "Rook") {
                        rookFirstMove = false;
                    }

                    this.setState({
                        sourceSelection: -1,
                        squares: squares,
                        whiteFallenSoldiers: whiteFallenSoldiers,
                        blackFallenSoldiers: blackFallenSoldiers,
                        player: player,
                        status: '',
                        turn: turn,
                        highLightMoves: [],
                        rookFirstMove: rookFirstMove
                    });
                } else {
                    this.setState({
                        status: "Wrong selection. Choose valid source and destination again.",
                        sourceSelection: -1,
                        highLightMoves: [],
                        squares: squares
                    });
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
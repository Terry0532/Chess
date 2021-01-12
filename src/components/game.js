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
            firstMove: undefined
        }
    }

    handleClick(i) {
        const squares = this.state.squares.slice();

        if (this.state.sourceSelection === -1) {
            if (!squares[i] || squares[i].player !== this.state.player) {
                this.setState({ status: "Wrong selection. Choose player " + this.state.player + " pieces." });
                squares[i] ? squares[i].style = { ...squares[i].style, backgroundColor: "" } : null;
            }
            else {
                squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html

                const highLightMoves = squares[i].possibleMoves(i, squares);
                console.log(i)
                for (let index = 0; index < highLightMoves.length; index++) {
                    const element = highLightMoves[index];
                    squares.splice(element, 1, { style: { backgroundColor: "RGB(111,143,114" } });
                }

                this.setState({
                    status: "Choose destination for the selected piece",
                    sourceSelection: i
                });
            }
        }

        else if (this.state.sourceSelection > -1) {

            //highlight selected piece
            squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };

            if (squares[i] && squares[i].player === this.state.player) {
                this.setState({
                    status: "Wrong selection. Choose valid source and destination again.",
                    sourceSelection: -1,
                });
            }
            else {

                const squares = this.state.squares.slice();
                const whiteFallenSoldiers = this.state.whiteFallenSoldiers.slice();
                const blackFallenSoldiers = this.state.blackFallenSoldiers.slice();

                if (squares[this.state.sourceSelection].name === "Pawn") {
                    //to determine if its possible to do en passant capture
                    let enpassant;
                    if (this.state.sourceSelection - 1 === this.state.lastTurnPawnPosition || this.state.sourceSelection + 1 === this.state.lastTurnPawnPosition) {
                        if (this.state.firstMove) {
                            enpassant = true;
                        }
                    }

                    const isDestEnemyOccupied = squares[i] ? true : false;
                    const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied, enpassant, this.state.lastTurnPawnPosition);
                    const srcToDestPath = squares[this.state.sourceSelection].getSrcToDestPath(this.state.sourceSelection, i);
                    const isMoveLegal = this.isMoveLegal(srcToDestPath);

                    if (isMovePossible && isMoveLegal) {
                        //if en passant is available and player decided to use it, else proceed without it
                        if (enpassant && squares[i] == null && (this.state.lastTurnPawnPosition - 8 === i || this.state.lastTurnPawnPosition + 8 === i)) {
                            if (squares[this.state.lastTurnPawnPosition].player === 1) {
                                whiteFallenSoldiers.push(squares[this.state.lastTurnPawnPosition]);
                            }
                            else {
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
                                turn: turn
                            });
                        } else {
                            if (squares[i] !== null) {
                                if (squares[i].player === 1) {
                                    whiteFallenSoldiers.push(squares[i]);
                                }
                                else {
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
                                lastTurnPawnPosition: lastTurnPawnPosition
                            });
                        }
                    }
                    else {
                        this.setState({
                            status: "Wrong selection. Choose valid source and destination again.",
                            sourceSelection: -1,
                        });
                    }
                } else {
                    const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i);
                    const srcToDestPath = squares[this.state.sourceSelection].getSrcToDestPath(this.state.sourceSelection, i);
                    const isMoveLegal = this.isMoveLegal(srcToDestPath);

                    if (isMovePossible && isMoveLegal) {
                        if (squares[i] !== null) {
                            if (squares[i].player === 1) {
                                whiteFallenSoldiers.push(squares[i]);
                            }
                            else {
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
                            turn: turn
                        });
                    }
                    else {
                        this.setState({
                            status: "Wrong selection. Choose valid source and destination again.",
                            sourceSelection: -1,
                        });
                    }
                }

            }
        }

    }

    /**
     * Check all path indices are null. For one steps move of pawn/others or jumping moves of knight array is empty, so  move is legal.
     * @param  {[type]}  srcToDestPath [array of board indices comprising path between src and dest ]
     * @return {Boolean}               
     */
    isMoveLegal(srcToDestPath) {
        let isLegal = true;
        for (let i = 0; i < srcToDestPath.length; i++) {
            if (this.state.squares[srcToDestPath[i]] !== null) {
                isLegal = false;
            }
        }
        return isLegal;
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
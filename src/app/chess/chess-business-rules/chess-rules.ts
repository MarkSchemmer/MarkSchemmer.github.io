
// Things we need to deal with.
// Can piece move?
// Can piece attack?
// Does this cause check?
// Is there checkmate?
// This entity should live on piece? maybe it should.

import { isValue } from "utils/Utils";
import { ChessCell } from "../ChessCell/ChessCell";
import { Piece, PieceColor, PieceName } from "../chess-utils/Piece";
import { ChessCellClone, PieceMapClone } from "../chessGrid/chessGrid";


/*
    First test implmentation is perfecting rules of the Pond.

    - When can move 2 moves
    - When can attack left and right
    - When reaches end of board it can change to better piece -> after game
    - When it's time to implement "En Passant" detection -> after game

*/

class FocusedCellWithMoves {
    public FocusedCell: ChessCell;
    public Moves: ChessCell[];
}

export class ChessRules {
    /*

        Logic for when a piece can move on attack? 

        - Causes check? -> will do this logic later in the game. 

        - Is it the other team's piece? only can take the
    
    */

    

    public WhiteKingCheckMate = (KingCell: ChessCell, AllBlackPieces: ChessCell[], pieceMap, FindAllPiecesOfSameColorWithCopyMapData) => {   
            
       // I need to test if black is in check mate. 

        // So basically, a move is made by white, and I need to check if 
        // that is check mate. 

        // so I simulate all possible moves from black, and test all

        // moves, and test if black is still in check.




        /*
            basically all moves should be check, which means it's 
            checkmate

            so checkmate would like this

            checkMate.every(c => c === true);
        */
            let checkMate: boolean[] = [];

            let kingPiece = KingCell.piece;
            let KingColor = KingCell.piece.pieceColor;
            let KingCoordinate = KingCell.coordinate.chessCoordinate;
    
            let allMoves = AllBlackPieces.reduce(
            (accumulation: FocusedCellWithMoves[], chessCell: ChessCell) => 
            {
               let otherMovesFromOtherPieces = chessCell.piece.FindMovesAndReturnCells(chessCell);
               accumulation.push({ FocusedCell: chessCell, Moves: otherMovesFromOtherPieces });
               return accumulation;
            }, 
                [ ]
            ); 
    
            allMoves.forEach((focusedCell: FocusedCellWithMoves) => {
                let fromCell = focusedCell.FocusedCell;
                let moves = focusedCell.Moves;
    
                moves.forEach((cell: ChessCell) => {
                    let toCell = cell;
                    let isValidMove = this.calculateIfMoveIsValidAndCheck(fromCell, toCell);
    
                    if (isValidMove)
                    {
                        // need to simulate the move
                        let clonedBoard = PieceMapClone(pieceMap);
                        clonedBoard[toCell.coordinate.chessCoordinate].piece = fromCell.piece;
                        clonedBoard[fromCell.coordinate.chessCoordinate].piece = null;
                        // need to check if we're in check
                        let result = this.isWhiteInCheck(KingCell, clonedBoard, FindAllPiecesOfSameColorWithCopyMapData);
                        // add result to checkMate
                        checkMate.push(result);
                    }
    
                });
            });
    
            // Iterate through all moves, and find 1 legal move out of check. 
            // If none exist then 
    
            // Need to calculate each move.
            
            // I have all moves stored up. 
            // I have a way for telling if Black is in check. 
    
            // The point of this move is simulate all moves of black
            // and then test if any move can get us out of check
            // if no move can
            // Then we return true witch means it's 
    
            console.log(checkMate);
    
            return checkMate.every(c => c === true);  
    }

    public BlackKingCheckMate = (KingCell: ChessCell, AllBlackPieces: ChessCell[], pieceMap, FindAllPiecesOfSameColorWithCopyMapData) => {   
        

        // I need to test if black is in check mate. 

        // So basically, a move is made by white, and I need to check if 
        // that is check mate. 

        // so I simulate all possible moves from black, and test all

        // moves, and test if black is still in check.




        /*
            basically all moves should be check, which means it's 
            checkmate

            so checkmate would like this

            checkMate.every(c => c === true);
        */
        let checkMate: boolean[] = [];

        let kingPiece = KingCell.piece;
        let KingColor = KingCell.piece.pieceColor;
        let KingCoordinate = KingCell.coordinate.chessCoordinate;

        let allMoves = AllBlackPieces.reduce(
        (accumulation: FocusedCellWithMoves[], chessCell: ChessCell) => 
        {
           let otherMovesFromOtherPieces = chessCell.piece.FindMovesAndReturnCells(chessCell);
           accumulation.push({ FocusedCell: chessCell, Moves: otherMovesFromOtherPieces });
           return accumulation;
        }, 
            [ ]
        ); 

        allMoves.forEach((focusedCell: FocusedCellWithMoves) => {
            let fromCell = focusedCell.FocusedCell;
            let moves = focusedCell.Moves;

            moves.forEach((cell: ChessCell) => {
                let toCell = cell;
                let isValidMove = this.calculateIfMoveIsValidAndCheck(fromCell, toCell);

                if (isValidMove)
                {
                    // need to simulate the move
                    let clonedBoard = PieceMapClone(pieceMap);
                    clonedBoard[toCell.coordinate.chessCoordinate].piece = fromCell.piece;
                    clonedBoard[fromCell.coordinate.chessCoordinate].piece = null;
                    // need to check if we're in check
                    let result = this.isBlackInCheck(KingCell, clonedBoard, FindAllPiecesOfSameColorWithCopyMapData);
                    // add result to checkMate
                    checkMate.push(result);
                }

            });
        });

        // Iterate through all moves, and find 1 legal move out of check. 
        // If none exist then 

        // Need to calculate each move.
        
        // I have all moves stored up. 
        // I have a way for telling if Black is in check. 

        // The point of this move is simulate all moves of black
        // and then test if any move can get us out of check
        // if no move can
        // Then we return true witch means it's 

        console.log(checkMate);

        return checkMate.every(c => c === true);
    }

    public KingCheck = (KingCell: ChessCell, AllOtherOposingPieces: ChessCell[]) => {
        /*
            Basically if checking that white is in check, we pass the White-King and then pass
            Black-pieces, and then scan all Black possibly moves, if any of Black-pieces have canMoveOrAttack quadrant
            where the Black is located then it is "check"
        */
        let kingPiece = KingCell.piece;
        let KingColor = KingCell.piece.pieceColor;
        let KingCoordinate = KingCell.coordinate.chessCoordinate;
        // console.log(KingColor);
        // console.log(`Kings coordinate: ${KingCoordinate}`);
        // console.log(`Kings color: ${KingColor}`);
        let allMoves = [];

        AllOtherOposingPieces.forEach((c: ChessCell) => {
           // console.log(c.piece.pieceColor);
           let otherMovesFromOtherPieces = c.piece.FindMovesAndReturnCells(c);
           allMoves = [ ...allMoves, ...otherMovesFromOtherPieces ];
        });

        let isKinginCheck = allMoves.some((c: ChessCell) => {
            // console.log(c.coordinate.chessCoordinate);
            return c.coordinate.chessCoordinate === KingCoordinate;
        });

        return isKinginCheck;
    }

    public isBlackInCheck = (blackKing, pieceMap, FindAllPiecesOfSameColorWithCopyMapData) => {
        let allWhitePieces = FindAllPiecesOfSameColorWithCopyMapData(PieceColor.WHITE, pieceMap);
        console.log(allWhitePieces);
        return this.KingCheck(blackKing, allWhitePieces);
    }

    public isWhiteInCheck = (whiteKing, pieceMap, FindAllPiecesOfSameColorWithCopyMapData) => {
        return this.KingCheck(whiteKing, FindAllPiecesOfSameColorWithCopyMapData(PieceColor.BLACK, pieceMap));
    }

    public isNotSameColor = (currentCell: ChessCell, otherCell: ChessCell): boolean => {
        return !this.isSameColor(currentCell, otherCell);
    }

    public isSameColor = (currentCell: ChessCell, otherCell: ChessCell): boolean => {
        let currentCellColor = currentCell.piece.pieceColor;
        let otherCellColor = otherCell && otherCell.piece && otherCell.piece.pieceColor;

        if (otherCellColor === null) return true;

        return currentCellColor === otherCellColor;
    }

    public canPondAttack = (currentCell: ChessCell, leftOrRightCell: ChessCell): boolean => {
        return leftOrRightCell.cellIsNotEmpty() && this.isNotSameColor(currentCell, leftOrRightCell);
    }

    // Method for when a pond can move left or right, it's not so much about 
    // moving left or right 
    public pondHasMoved = (cell): boolean => {
        return isValue(cell.piece) && cell.piece.hasMoved === true;
    }

    public pondHasNotMoved = (cell): boolean => {
        return !this.pondHasMoved(cell);
    }
    // Will add check logic later, basically asking can make a move if
    // this will cause check on the King. 

    public canPondMove2SpacesOnFirstMove = (cell, nextCell, nextNextCell): boolean => {
        return this.pondHasNotMoved(cell) && isValue(nextCell) && nextCell.cellIsEmpty() && isValue(nextNextCell) && nextNextCell.cellIsEmpty();
    }

    public canPondMove1SpaceForward = (cell, nextCell): boolean => {
        return isValue(nextCell) && nextCell.cellIsEmpty();
    }

    // Need to implement. 
    public canKingMove = (fromCell: ChessCell, toCell: ChessCell, kingColor: PieceColor, pieceMap): boolean => {
        if (kingColor === PieceColor.WHITE) {
            return this.canWhiteKingMove(fromCell, toCell, pieceMap);
        } else {
            return this.canBlackKingMove(fromCell, toCell, pieceMap);
        }
    }

    public canBlackKingMove = (fromCell: ChessCell, toCell: ChessCell, pieceMap): boolean => {
       if (isValue(toCell)) 
       {
            let clonedPieceMap = PieceMapClone(pieceMap);
            if((toCell.cellIsNotEmpty() && this.isNotSameColor(fromCell, toCell)) || toCell.cellIsEmpty()) 
            {
                clonedPieceMap[fromCell.coordinate.chessCoordinate].piece = null;
                clonedPieceMap[toCell.coordinate.chessCoordinate].piece = fromCell.piece;
                let blackKing = clonedPieceMap[toCell.coordinate.chessCoordinate];
                let allWhitePieces = Object.values((c:ChessCell) => isValue(c.piece) && c.piece.pieceColor === PieceColor.WHITE);
                let kingInCheck = this.KingCheck(blackKing, allWhitePieces);
                return kingInCheck === false;
            }
            else 
            {
                return false;
            }
       }
       else 
       {
            return false;
       }
    }

    public canWhiteKingMove = (fromCell: ChessCell, toCell: ChessCell, pieceMap): boolean => {
        if (isValue(toCell)) 
        {
             let clonedPieceMap = PieceMapClone(pieceMap);
             if((toCell.cellIsNotEmpty() && this.isNotSameColor(fromCell, toCell)) || toCell.cellIsEmpty()) 
             {
                 clonedPieceMap[fromCell.coordinate.chessCoordinate].piece = null;
                 clonedPieceMap[toCell.coordinate.chessCoordinate].piece = fromCell.piece;
                 let whiteKing = clonedPieceMap[toCell.coordinate.chessCoordinate];
                 let allBlackPieces = Object.values((c:ChessCell) => isValue(c.piece) && c.piece.pieceColor === PieceColor.BLACK);
                 let kingInCheck = this.KingCheck(whiteKing, allBlackPieces);
                 return kingInCheck === false;
             }
             else 
             {
                 return false;
             }
        }
        else 
        {
             return false;
        }
    }

    // Later on in time, will add a more advanced calculation for knight movements.
    public canKnightMove = (cell: ChessCell, otherCell: ChessCell): boolean => {
        if (isValue(otherCell)) 
        {
            if (otherCell.cellIsEmpty()) return true;

            if (this.isNotSameColor(cell, otherCell)) 
            { 
                return true;
            } 
            else 
            {
                return false;
            }
        } 
        else 
        {
            return false;
        }
    }

    public isValidMove = (fromCell:ChessCell, toCell:ChessCell): boolean => {
        if (isValue(toCell)) 
        {
            if (toCell.cellIsEmpty()) return true;

            if (this.isNotSameColor(fromCell, toCell)) return true;

            return false;
        }
        else 
        {
            return false;
        }
    }
    // One public move that then determines if can move or not. 
   // public calculateMove
   // My idea for calculating moves for all pieces, call one method, then 
   // How do we even determine what direction we're going? 
   // Maybe it's a bit too early to implement this type of 
   // logic for the moment, but I surly can implement 
   // stand alone methods for the moment. 
   // I'm thinking for future refactor we condence all chess to a central method such as 
   // calculate, when and after all chess methods have been calculated and 
   public calculateIfMoveIsValidAndCheck = (fromCell:ChessCell, toCell:ChessCell): boolean => {
        switch(fromCell.piece.PieceName) {
            case PieceName.POND: 
            case PieceName.ROOK: 
            case PieceName.BISHOP: 
            case PieceName.KNIGHT: 
            case PieceName.QUEEN: 
            case PieceName.KING: {
                return this.isValidMove(fromCell, toCell);
            }
            default: {
                console.log("caluclating the default. ");
                return false;
            }
        }
   }
}
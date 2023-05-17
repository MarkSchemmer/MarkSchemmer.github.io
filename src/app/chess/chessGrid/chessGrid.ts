import { Coordinate } from "src/app/common/utils";
import { isValue } from "utils/Utils";
import { ChessCoordinate, connectBoard } from "../chess-utils/utils";
import { ChessCell, IChessCell } from "../ChessCell/ChessCell";
import { ChessRules } from "../chess-business-rules/chess-rules";
import { Bishop, BlackBishop, BlackKing, BlackKnight, BlackPond, BlackQueen, BlackRook, ChessPieceFactory, Piece, PieceColor, PieceName, WhiteBishop, WhiteKing, WhiteKnight, WhitePond, WhiteQueen, WhiteRook } from "../chess-utils/Piece";


/*
      TODO: 

      WRITE YOUR OWN DEEPLONE, SO THEN YOU CAN GO AND continue your work. 



*/

/*
  I'm needing to write horizontal -> either a - h

  On the vertical 1 - 8

  Chess green base black square: #769656
 
  Chess white base white square: #eeeed2

  The way for prouducing 
*/

// DeepCopy type can be easily extended by other types,
// like Set & Map if the implementation supports them.
// type DeepCopy<T> =
//     T extends undefined | null | boolean | string | number ? T :
//     T extends Function | Set<any> | Map<any, any> ? unknown :
//     T extends ReadonlyArray<infer U> ? Array<DeepCopy<U>> :
//     { [K in keyof T]: DeepCopy<T[K]> };

// function deepCopy<T>(obj: T): DeepCopy<T> {
//     // implementation doesn't matter, just use the simplest
//     return JSON.parse(JSON.stringify(obj));
// }

/*

  PieceMap 

  { [key: string] : ChessCell };

  The biggest object we have is the pieceMap

  String key and ChessCell object, 

  The peice is composed of 64 key ChessCell objects...

  ChessCell: 
      * ChessCoordinate
      * chessCellColor
      * Piece


  - ChessCoordinate
      *x
      *y

  - Piece
      No constructor just have to get the instanceOf to properly match. 


  Chess

make a get cell on chessCoordinate, so matching a cell on chessCoordinate.
 

*/

export const PieceMapClone = (pieceMap: { [key: string] : ChessCell }) => {
    let newPieceMap: { [key: string] : ChessCell } = {};

    for (let key in pieceMap) 
    {
      newPieceMap[key] = ChessCellClone(pieceMap[key]);
    }

    connectBoard(newPieceMap);

    return newPieceMap;
};

export const ChessCellClone = (cell: ChessCell) => {
  let cellColor = cell._cellColor;
  let piece = pieceClone(cell.piece);
  let coordinate = ChessCoordinateClone(cell.coordinate);


  let newCell = new ChessCell(coordinate, cellColor, piece);

  newCell.xRange = cell.xRange;
  newCell.yRange = cell.yRange;
  newCell._cellColor = cell._cellColor;
  newCell.isAlive = cell.isAlive;
  newCell.redSquareActivated = cell.redSquareActivated;
  newCell.canMoveToOrAttack = cell.canMoveToOrAttack;
  newCell.cellsColor = cell.cellsColor;
  newCell.letterText = cell.letterText;
  newCell.numberText = cell.numberText;
  newCell.row = cell.row;
  newCell.col = cell.col;

  return newCell;

}

const ChessCoordinateClone = (coordinate: ChessCoordinate) => {
  return new ChessCoordinate(coordinate.x, coordinate.y);
}

const ofType = (p) => (o) => p instanceof o;

const isWhite = (p:Piece) => p.pieceColor === PieceColor.WHITE;

const getNewPiece = (p: Piece) => {
  switch(p.PieceName) {
    case PieceName.POND: {
      return isWhite(p) ? new WhitePond() : new BlackPond();
    }
    case PieceName.BISHOP: {
      return isWhite(p) ? new WhiteBishop() : new BlackBishop();
    }
    case PieceName.KING: {
      return isWhite(p) ? new WhiteKing() : new BlackKing();
    }
    case PieceName.KNIGHT: {
      return isWhite(p) ? new WhiteKnight() : new BlackKnight();
    }
    case PieceName.QUEEN: {
      return isWhite(p) ? new WhiteQueen() : new BlackQueen();
    }
    case PieceName.ROOK: {
      return isWhite(p) ? new WhiteRook() : new BlackRook();
    }
    default: {
      return null;
    }
  }
  
}

const pieceClone = (p: Piece) => {
  if (p === null) return null;

  let newPiece = getNewPiece(p);

  newPiece.hasRun = p.hasRun;
  newPiece.hasMoved = p.hasMoved;

  return newPiece;
}

export class ChessGrid {

    public blackInCheck: boolean = false;
    public whiteInCheck: boolean = false;
    public whiteInCheckMate: boolean = false;
    public blackInCheckMate: boolean = false;
    public whosMoveisIt: PieceColor = PieceColor.WHITE;

    // dimension of each square
     public thickness = 1;
     public black = "#000";
     // Highlighted yellow square
     public yellowSquare = "#fff576bd";

     public couldMoveSquare = "#09f7e175";
     // Highlighted red square
     // rgb(236 126 106); convert into hex -> 
     public redSquare = "#ec7e6ac7";
     public resolution;
     public COLS;
     public ROWS;
     public ctx;
     public grid;
     public sqaureIsFocused = false;
     public currentFocusedSquare: Coordinate = null;
     public focusedCell: ChessCell = null;
     public chessRules: ChessRules = new ChessRules();

     public blackKing: ChessCell = null;
     public whiteKing: ChessCell = null;

     // Can add a hash map for simplification.
     public pieceMap: { [key: string] : ChessCell };
   
     constructor(grid, resolution, c, r, ctx) {
      this.resolution = resolution;
      this.COLS = c;
      this.ROWS = r;
      this.grid = grid;
      this.ctx = ctx;

      this.pieceMap = (grid.flat())
       .reduce((acc, cur, idx) => {
        acc[cur.coordinate.chessCoordinate] = cur; 
        return acc;
      }, {});
       // console.log(this.pieceMap);
      this.calculateRange(this.grid);
      connectBoard(this.pieceMap);

      this.blackKing = this.findBlackKing();
      this.whiteKing = this.findWhiteKing();

     }

     public changeWhosMoveItIs = () => {
        if (this.whosMoveisIt === PieceColor.WHITE) {
          this.whosMoveisIt = PieceColor.BLACK;
        } else {
          this.whosMoveisIt = PieceColor.WHITE;
        }
     }

     public calculateRange = grid => {
      for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
          const cell: IChessCell = grid[col][row];
          cell.xRange = (col * this.resolution);
          cell.yRange = (row * this.resolution);
        }
      }
    }
   
     public draw = () => {
       for (let col = 0; col < this.grid.length; col++) {
         for (let row = 0; row < this.grid[col].length; row++) {
           this.ctx.clearRect(col * this.resolution, row * this.resolution, this.resolution, this.resolution);
           const cell: ChessCell = this.grid[col][row];
           this.ctx.beginPath();
           this.ctx.rect(col * this.resolution, row * this.resolution, this.resolution, this.resolution);
           this.ctx.stroke();
           
           this.ctx.fillStyle = cell.cellsColor;
           this.ctx.fill();
           
           if (cell.isAlive) 
           { 
              this.ctx.fillStyle = this.yellowSquare;
              this.ctx.fill(); 
           }

           if (cell.canMoveToOrAttack) 
           {
              this.ctx.fillStyle = this.couldMoveSquare;
              this.ctx.fill();
           }

           if (cell.redSquareActivated) 
           {
              this.ctx.fillStyle = this.redSquare;
              this.ctx.fill();
           }

           if (cell.letterText != null) 
           {
              this.ctx.fillStyle = this.black;
              this.ctx.font = "20px Arial";
              this.ctx.fillText(cell.letterText, cell.xRange + 8, cell.yRange + 20);
           }

           if (cell.numberText != null) 
           {
              //console.log(cell.numberText);
              this.ctx.fillStyle = this.black;
              this.ctx.font = "20px Arial";
              this.ctx.fillText(cell.numberText, cell.xRange + 80, 795);
           }

           if (cell.piece != null) 
           {
              cell.piece.draw(this.ctx, cell.xRange + 25, cell.yRange + 25);
           }
         }
       }
     }

     public findBlackKing = () => this.FindPieces(PieceColor.BLACK, PieceName.KING)[0];

     public findWhiteKing = () => this.FindPieces(PieceColor.WHITE, PieceName.KING)[0];

     public FindPieces = (color: PieceColor, pieceName: PieceName) => {
        return Object.values(this.pieceMap).filter((c: ChessCell) => {
           return c.piece && c.piece.PieceName === pieceName && c.piece.pieceColor === color;
        });
     }

     public FindAllPiecesOfSameColor = (color: PieceColor) => {
      // console.log(this.pieceMap);
      return Object.values(this.pieceMap).filter((c: ChessCell) => {
        return c.piece && c.piece.pieceColor === color;
      });
     }

     public FindAllPiecesOfSameColorWithCopyMapData  = (color, pieceMap): ChessCell[] => {
      // console.log(this.pieceMap);

      // console.log(pieceMap);
      // console.log(color); 
      let result = []

      for (let key in pieceMap) {
        if (pieceMap[key].piece) {
          // console.log(pieceMap[key].piece);

          // console.log(pieceMap[key].piece.pieceColor)
          if (pieceMap[key].piece.pieceColor === color){
            result.push(pieceMap[key]);
          }

        }
      }

      return result;
     }

     public resetAllSquares = () => {
        Object.values(this.pieceMap).forEach((c: ChessCell) => {
          c.isAlive = false;
          c.redSquareActivated = false;
          c.canMoveToOrAttack = false;
        });
     }

     public resetAllYellowSquares = () => {
        Object.values(this.pieceMap).forEach((c: ChessCell) => {
          c.isAlive = false;
        });
     }

     public resetAllRedSquares = () => {
        Object.values(this.pieceMap).forEach((c: ChessCell) => {
          c.redSquareActivated = false;
        });
     }

     public unSelectedOldSelectedSquares = () => {
      Object.values(this.pieceMap).forEach((c: ChessCell) => {
        c.canMoveToOrAttack = false;
      });
     }

     public areRedSquaresActive = (): boolean => {
       return Object.values(this.pieceMap).some(cell => cell.redSquareActivated === true)
     }

    public isYellowSquareActive = (): boolean => {
      return Object.values(this.pieceMap).some(cell => cell.isAlive === true)
    }

    public focusSquare = (cell: ChessCell) => {
          // console.log(cell.coordinate.chessCoordinate);
          // We need to toggle the cell.
          cell.isAlive = !cell.isAlive;
          // we need to make the sqaure active
          if (isValue(cell.piece) && cell.isAlive) {
            cell.piece.FindMoves(cell);
            this.focusedCell = cell;
          } else {
            this.unFocusOldSquare(cell);
          }

      // we need to also make sure that paths it can move or attack are also
      // highlighted
      this.focusedCell = cell;
    }

    public unFocusOldSquare = (cell: ChessCell) => {
      cell.isAlive = false;
      if (isValue(cell.piece)) {
        this.unSelectedOldSelectedSquares();
      }
    }

    public focusNewSquare = (cell: ChessCell) => {
      // first unfocus old square
      if (isValue(cell.piece)) {
        this.unFocusOldSquare(this.focusedCell);
      }
      
      // Second focus new square
      this.focusSquare(cell);
    }


    public isBlackInCheck = () => {
      let king = this.findBlackKing();
      let allPieces = this.FindAllPiecesOfSameColor(PieceColor.WHITE);

      return this.chessRules.KingCheck(king, allPieces);
    }

    public isWhiteInCheck = () => {
      let king = this.findWhiteKing();
      let allPieces = this.FindAllPiecesOfSameColor(PieceColor.BLACK);

      return this.chessRules.KingCheck(king, allPieces);
    }

    public ischecked = (): boolean => {
      let king = this.whosMoveisIt === PieceColor.WHITE ? this.findBlackKing(): this.findWhiteKing();
      let allPieces = this.FindAllPiecesOfSameColor(this.whosMoveisIt === PieceColor.WHITE ? PieceColor.WHITE : PieceColor.BLACK);
      let kingColor = king.piece.pieceColor;
      let isChecked = this.chessRules.KingCheck(king, allPieces);

      if (isChecked) 
      {
        if (kingColor === PieceColor.BLACK) 
        {
          this.blackInCheck = true;
        } 
        else 
        {
          this.whiteInCheck = true;
        }
      }
      else 
      {
        if (kingColor === PieceColor.BLACK) 
        {
          this.blackInCheck = false;
        }
        else 
        {
          this.whiteInCheck = false;
        }
      }

      return isChecked;
    }






    public movePieceToSquare = (cell) => {

        /* if white in check, or black in check, and it's your turn. 
            You need to move out of check someway. 

            Process for getting out of check

            1. Can King move out of check? 

            2. Can other piece move to kill other piece putting King in check?
        */


        // focused cell moving to cell
        // Primitive movement will if will be 
        // focused.piece to cell.piece;
        let FocusedPastPieceCoordinate = this.focusedCell.coordinate.chessCoordinate;
        let FocusedPiece = this.focusedCell.piece;


        this.pieceMap[cell.coordinate.chessCoordinate].piece = null;
        cell.piece = null;

        cell.piece = FocusedPiece;
        this.pieceMap[cell.coordinate.chessCoordinate].piece = FocusedPiece;

        cell.piece.hasMoved = true;
        this.pieceMap[cell.coordinate.chessCoordinate].piece.hasMoved = true;

        this.focusedCell.piece = null;
        this.focusedCell = null;

        // this.pieceMap[FocusedPastPieceCoordinate].piece = null;

        this.resetAllSquares();
        this.draw();

        // when move is done basically we need to check if a check occured.
        let hasChecked = this.ischecked();

        if (hasChecked) 
        {
          if (this.blackInCheck) 
          {
            alert("blacks king is in check. ");
            // check if checkMate for black
            let blackKing = this.findBlackKing();
            let AllBlackPieces = this.FindAllPiecesOfSameColor(PieceColor.BLACK);
            let isBlackInCheckMate = this.chessRules.BlackKingCheckMate(blackKing, AllBlackPieces, this.pieceMap, this.FindAllPiecesOfSameColorWithCopyMapData);

            if (isBlackInCheckMate)
            {
              alert("White WINS, BLACK IS CHECKMATED.");
              this.blackInCheckMate = true;
            }
          
          }

          if (this.whiteInCheck) 
          {
            alert("whites king is in check. ");
          }
        }

        this.changeWhosMoveItIs();
    }

    public isBlackMate = (cell:ChessCell) => {
        let copyCell = ChessCellClone(cell);
        let focusedCellCopy = ChessCellClone(this.focusedCell);
        let FocusedPiece = focusedCellCopy.piece;
        let pieceMap = PieceMapClone(this.pieceMap);
        let king = this.findBlackKing();
        let colorOfPiecesToFind = PieceColor.BLACK;
        let allPieces: ChessCell[] = this.FindAllPiecesOfSameColorWithCopyMapData(colorOfPiecesToFind, pieceMap);
        // let mate = this.chessRules.KingCheckMate(king, allPieces, pieceMap, this.FindAllPiecesOfSameColorWithCopyMapData, colorOfPiecesToFind);
        // return mate;
    }

    public isWhiteMate = (cell:ChessCell) => {
      let copyCell = ChessCellClone(cell);
      let focusedCellCopy = ChessCellClone(this.focusedCell);
      let FocusedPiece = focusedCellCopy.piece;
      let pieceMap = PieceMapClone(this.pieceMap);
      let king = this.findWhiteKing();
      let colorOfPiecesToFind = PieceColor.WHITE;
      let allPieces: ChessCell[] = this.FindAllPiecesOfSameColorWithCopyMapData(colorOfPiecesToFind, pieceMap);
      // let mate = this.chessRules.KingCheckMate(king, allPieces, pieceMap, this.FindAllPiecesOfSameColorWithCopyMapData, colorOfPiecesToFind);
      // return mate;
    }

    public doesMoveUnCheckKing = (cell: ChessCell) => {

      let copyCell = ChessCellClone(cell);
      let focusedCellCopy = ChessCellClone(this.focusedCell);
      let FocusedPiece = focusedCellCopy.piece;
      let pieceMap = PieceMapClone(this.pieceMap);

      pieceMap[cell.coordinate.chessCoordinate].piece = null;
      copyCell.piece = null;

      copyCell.piece = FocusedPiece;
      pieceMap[cell.coordinate.chessCoordinate].piece = FocusedPiece;

      copyCell.piece.hasMoved = true;
      pieceMap[cell.coordinate.chessCoordinate].piece.hasMoved = true;


      let whosMove = this.whosMoveisIt;


      // we need to find that colors King.

      let king = whosMove === PieceColor.WHITE ? this.findWhiteKing() : this.findBlackKing();

      // the color of the pieces we need to find, will be opposite of the color of king we have.

      let colorOfPiecesToFind = king.piece.pieceColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
      let allPieces: ChessCell[] = this.FindAllPiecesOfSameColorWithCopyMapData(colorOfPiecesToFind, pieceMap);


      // console.log(allPieces);

      let areWeStillChecked = this.chessRules.KingCheck(king, allPieces);


      // if we are still checked, let's check for checkmate...?


      // console.log(areWeStillChecked);

      // if we return this, we are saying that false is true, and true is false, basically saying 
      // the opposite of if we are checked, so not checked is true, and checked is false. 

     return areWeStillChecked === false;
    }

    public gameCallStructure = (isChecked, cell, isBlacksTurn, isWhitesTurn, isBlackInCheck, isWhiteInCheck) => {

      if (isChecked) 
      {
        if (isWhitesTurn) 
        {
          // whites turn.
          if (isWhiteInCheck) 
          {
            // Make IsWhiteInCheckMate logic here. 
            let doesMoveUnCheckUs = this.doesMoveUnCheckKing(cell);

            if (doesMoveUnCheckUs) {
              this.movePieceToSquare(cell);
            }
            else {
              // Need to add check-mate logic here. 
              alert("invalid move, WHITE is in check. ");
            }
          } 
          else 
          {
            this.movePieceToSquare(cell);
          } 
        }
        else 
        {
          // blacks turn
          if (isBlackInCheck) 
          {
            // checkmate logic here.
            // isBlackInCheckMate.

            let doesMoveUnCheckUs = this.doesMoveUnCheckKing(cell);

            if (doesMoveUnCheckUs) {
              this.movePieceToSquare(cell);
            }
            else {
              alert("invalid move, BLACK is in check. ");
            }
          }
          else 
          {
            this.movePieceToSquare(cell);
          }
        }
      } 
      else 
      {
        this.movePieceToSquare(cell); // not in check and can make legal move.
      }
    }

    public clickSquare = (x, y, e, isLeftClick) => {
      /*
          Logic for finding check will not interupt the game as of now, 

          it will only just log and alert for the moment. 
      */

      // this.chessRules.KingCheck(king, allPieces);
      /*

          Things I need to know before we can logically code this out

            - Check if were in check, if were not in check then we can make a move

          Logic for 'check', can check opposing team

          Logic, can't move if in check, if in check you must move out of check

          Logic
      
      */


      /*
         Items we need to cover when handling a click. 


         Note: 

         For determining intent to move piece, you need to have a focused cell
         And then you
      */
      let c: ChessCell = this.grid[x][y];
      let cell: ChessCell = this.pieceMap[c.coordinate.chessCoordinate];
      // console.log(cell);
      // console.log(this.focusedCell);
      let piece = cell.piece;
      let isValidPiece = isValue(piece);
      // Allows user to actually make a move, only move a piece if it is in fact it's turn.
      // How do we determine whos move it is? 
      // White goes first
      // Then Black
      // ect... flip flopping the turn.
      let pieceColor: PieceColor = this.focusedCell === null ? null : this.focusedCell.piece.pieceColor;
      let canMove: boolean = pieceColor !== null && pieceColor === this.whosMoveisIt;
      // Here we need to realize if we are in check
      // We need to determine if we can make a move out of check
      // if we are in check, then move out of check or look for 'check-mate' detection
      // if we are not in check, then just make a normal move
      // algorithm for searching for check
      // algorithm for getting out of check

      // if in check, then the next move needs to be out of check. 

      if (isLeftClick) 
      {

        /*
            Need to check if black is in check.

            Need to check if white is in check.

            Need to have two variables dertermining if it's blacks or whites turn. 
        */ 

        let isBlackInCheck = this.isBlackInCheck();
        let isWhiteInCheck = this.isWhiteInCheck();
        let isChecked = isBlackInCheck || isWhiteInCheck;

        let isBlacksTurn = this.whosMoveisIt === PieceColor.BLACK;
        let isWhitesTurn = this.whosMoveisIt === PieceColor.WHITE;

        // Now the logic is, if black is in check, and it's blacks turn, we have to make sure to 
        // to move out of check and vice of versa for white.

        // console.log(isChecked);



        if (isValidPiece) 
        { 
    
            // We need to reset all redsquares just in case. 
            this.resetAllRedSquares();
            // if no square is selected select square and focus
            if (this.focusedCell === null) { this.focusSquare(cell); }
            // If the square was clicked as the previous square
            else if (this.focusedCell.coordinate.chessCoordinate === cell.coordinate.chessCoordinate) { this.focusSquare(cell); }
            // We know it's not the same cell, also we know The pieces are different colors. 
            else if (this.focusedCell != null && this.focusedCell.piece.pieceColor != cell.piece.pieceColor && cell.canMoveToOrAttack && canMove) { 
   
              this.gameCallStructure(isChecked, cell, isBlacksTurn, isWhitesTurn, isBlackInCheck, isWhiteInCheck);
            }
            // In this else if sqaure block, 
            // Focusing new square that was clicked, so basically focus new square and unfocus old square
            else { this.focusNewSquare(cell); }
            // After all operations we update the previous cell
        }
        else if (this.focusSquare != null && cell.canMoveToOrAttack && canMove) { 
            this.gameCallStructure(isChecked, cell, isBlacksTurn, isWhitesTurn, isBlackInCheck, isWhiteInCheck);
        }
        // Clicked a square and we need to unofus all squares 
        else 
        {
          this.resetAllSquares();
          this.focusedCell = null;
        }
      }
      else 
      {
        cell.redSquareActivated = !cell.redSquareActivated;
      }
    }
   }


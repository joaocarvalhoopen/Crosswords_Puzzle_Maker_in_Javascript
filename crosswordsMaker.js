/******************************************************************************
 * 
 *                           crosswordsMaker.js
 * 
 *        Give in the words and it will make you the crosswords puzzle...
 * 
 ******************************************************************************
 * Author: Joao Nuno Carvalho
 * Date:   2020.01.21
 * 
 * Description: This is a Javascript program inside a HTML page that asks for
 *              words to make a crossword puzzle and tries to maximize the
 *              number of crosses over all words.
 * The algorithm that was developed, uses the strategy of BackTracking to
 * search for the best solution in the solution space. Less words or longer
 * words contributes to a smaller search space. The BackTracking strategy
 * implemented here, uses low memory and in most cases it's pretty fast, but
 * in a small number of cases it can be a bit slow. This depends on the size
 * of the search space. At the beginning of the code you can configure the
 * size of the board to search, currently it is a 11 x 11 square board, but it
 * can be of different sizes. The size of the Canvas can also be different. It
 * search's in all valid combination ranking it for the most crossovers among
 * all words.
 * 
 * Improvements for a latter phase: Implement a feature to automatically stop
 *                                  processing after a predetermine time 
 *                                  ex: 1 minute. This will stop the search,
 * but it's only necessary in a small number of cases. In the normal case it's
 * pretty fast. 
 *
 * References:
 *    Wikipedia - Crossword
 *       https://en.wikipedia.org/wiki/Crossword
 *    Algorithm to generate a crossword
 *       https://stackoverflow.com/questions/943113/algorithm-to-generate-a-crossword
 *    Source of words to make crosswords in several languages
 *       http://www.gwicks.net/dictionaries.htm
 * 
 * License:
 *    MIT Open Source License
 * 
 *****************************************************************************/

const MAX_X_ARRAY = 11; // 11; // 20 10
const MAX_Y_ARRAY = 11; // 11; // 20 10
const PAD_X_Y = 1;      // Padding around inside the interior of the canvas.
const LETTER_FONT = "30px Arial";
const LETTER_SIZE = 30;

const HORIZONTAL                             = 'H';
const VERTICAL                               = 'V';
const NO_HORIZ_NO_VERT                       = 'O';
const NO_CURR_ORIENT_AND_START_NO_END_OTHER  = 'N';

const EMPTY = '-';

let cwBoard = null
let wordsList = null


class Cell {
    static ctx = null
    static rectXSize = null
    static rectYSize = null
    static padXLetter = null
    static padYLetter = null

    constructor(x, y, letter) {
        if (Cell.ctx === null){
            // Fill the static class attributes.
            let canvas = document.getElementById("crosswordsCanvas");
            let width = canvas.width - PAD_X_Y * 2;
            let height = canvas.height - PAD_X_Y * 2; 
            Cell.ctx = canvas.getContext("2d");
            Cell.rectXSize = width / MAX_X_ARRAY;
            Cell.rectYSize = height / MAX_Y_ARRAY;
            Cell.padXLetter = LETTER_SIZE / 3.5;
            Cell.padYLetter = Cell.rectYSize - LETTER_SIZE / 3.5  
        }
        this.x = x;
        this.y = y;
        this.letter = letter;
    }

    clear(){
        this.letter = EMPTY;
    }

    draw( ){
        if (this.letter !== EMPTY){
            // Draw the rectangle frame.
            Cell.ctx.fillStyle = "#FF00FF"; // Black
            Cell.ctx.strokeRect(PAD_X_Y + Cell.rectXSize*this.x, PAD_X_Y + Cell.rectYSize*this.y,
                 Cell.rectXSize, Cell.rectYSize);
            // Draw the letter.
            Cell.ctx.font = LETTER_FONT;
            Cell.ctx.fillText(this.letter, 
                PAD_X_Y + Cell.rectXSize*this.x + Cell.padXLetter,
                PAD_X_Y + Cell.rectYSize*this.y + Cell.padYLetter);
        }
    }
}

class Board{
    constructor(sizeX, sizeY, targetBoardHasCells, boardInstance, sourceBoardHasCells) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.board = new Array(this.sizeX);
        this.boardHasCells = targetBoardHasCells;

        if (boardInstance == null){
            for (let i = 0; i < this.board.length; i++) {
                this.board[i] = new Array(this.sizeY);
                for (let j = 0; j < this.board[i].length; j++) {
                    if (this.boardHasCells){
                        this.board[i][j] = new Cell(i, j, EMPTY);
                    } else {
                        this.board[i][j] = EMPTY;
                    }
                }
            }
        } else {
            // Fill the instance attributes.
            this.sizeX = boardInstance.sizeX;
            this.sizeY = boardInstance.sizeY;
            // Creates the 2D array.
            for (let i = 0; i < this.board.length; i++) {
                this.board[i] = new Array(this.sizeY);
            }
            // Fill the 2D array with new Cell's. 
            for (let x = 0; x < this.board.length; x++){
                for (let y = 0; y < this.board[x].length; y++){
                    if (this.boardHasCells){
                        this.board[x][y] = new Cell(x, y, sourceBoardHasCells ? boardInstance.board[x][y].letter : boardInstance.board[x][y]);
                    } else {
                        this.board[x][y] = sourceBoardHasCells ? boardInstance.board[x][y].letter : boardInstance.board[x][y];
                    }
                }   
            }
            // Note: The processing and memory could be diminished if I created
            //       only one Cell for the empty Cell state , and shared it by 
            //       all Empty Cells.
            //       In the methods that add text to a Cell if it was an empty Cell,
            //       they would create the cell on the fly.
        }
    }

    draw(){
        // Clears the canvas for redrawing.
        let canvas = document.getElementById("crosswordsCanvas");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!(this.boardHasCells)){
            alert("board Has No Cells to Draw!");
            return;
        }

        for (let x = 0; x < this.board.length; x++){
            for (let y = 0; y < this.board[x].length; y++){
                this.board[x][y].draw();
            }   
        }
    }

    clear(){
        for (let x = 0; x < this.board.length; x++){
            for (let y = 0; y < this.board[x].length; y++){
                if (this.boardHasCells){
                    this.board[x][y].clear();
                } else {
                    this.board[x][y] = EMPTY;
                }
            }   
        }
    }

    setLetter(x, y, letter){
        if (this.boardHasCells){
            this.board[x][y].letter = letter;
        } else {
            this.board[x][y] = letter;
        }
    }

    setWordHorizontal(x, y, word){
        if (word.length <= this.sizeX - x){
            for (let i = 0; i < word.length; i++) {
                if (this.boardHasCells){
                    this.board[x+i][y].letter = word[i];
                } else {
                    this.board[x+i][y] = word[i];
                }
            }
            return true;
        } else {
            return false;
        }
    }

    setWordVertical(x, y, word){
        if (word.length <= this.sizeY - y){
            for (let j = 0; j < word.length; j++) {
                if (this.boardHasCells){
                    this.board[x][y+j].letter = word[j];
                } else {
                    this.board[x][y+j] = word[j];
                }
            }
            return true;
        } else {
            return false;
        }
    }

    setWordHorizontalGuard(x, y, word){
        /*
            Word = bli
            Pattern:
                ------- 
                --NNN--
                -ObliO-
                --NNN--
                -------
        */
        if (this.boardHasCells){
            console.write("Error: The board Has Cell's and that is invalid for setWordHorizontalGuard(x, y, word). ")
            return false;
        }
        if (word.length <= this.sizeX - x){
            for (let i = -1; i < word.length + 1; i++) {
                if ((x + i < 0) || ((x + i) > this.sizeX - 1)){
                    continue;
                }

                // The line before the word.
                if (y > 0){
                    if (!((i == -1 ) || ( i == word.length))){
                        this.board[x+i][y-1] = NO_CURR_ORIENT_AND_START_NO_END_OTHER;
                    }
                }
                
                // If it's at the top left or top right of the middle line of the word.
                if ((i == -1 ) || ( i == word.length)){
                    this.board[x+i][y] = NO_HORIZ_NO_VERT;
                } else {
                    this.board[x+i][y] = HORIZONTAL;
                }

                // The after the word.
                if (y < this.sizeY - 1){
                    if (!((i == -1 ) || ( i == word.length))){
                        this.board[x+i][y+1] = NO_CURR_ORIENT_AND_START_NO_END_OTHER;
                    }
                }
            }
            return true;
        } else {
            return false;
        }
    }

    setWordVerticalGuard(x, y, word){
        /*
            Word = bli
            Pattern:
                ----- 
                --O--
                -NbN-
                -NlN-
                -NiN-
                --O--
                -----
        */

        if (this.boardHasCells){
            Console.write("Error: The board Has Cell's and that is invalid for setWordVerticalGuard(x, y, word). ")
            return false;
        }
        if (word.length <= this.sizeY - y){
            for (let i = -1; i < word.length + 1; i++) {
                if ((y + i < 0) || ((y + i) > this.sizeY - 1)){
                    continue;
                }

                // The line before the word.
                if (x > 0){
                    if (!((i == -1 ) || ( i == word.length))){
                        this.board[x-1][y+i] = NO_CURR_ORIENT_AND_START_NO_END_OTHER;
                    }
                }

                // If it's at the top up or top down of the middle line of the word.
                if ((i == -1 ) || ( i == word.length)){
                    this.board[x][y+i] = NO_HORIZ_NO_VERT;
                } else {
                    this.board[x][y+i] = VERTICAL;
                }

                // The after the word.
                if (x < this.sizeX - 1){
                    if (!((i == -1 ) || ( i == word.length))){
                        this.board[x+1][y+i] = NO_CURR_ORIENT_AND_START_NO_END_OTHER;
                    }
                }

            }
            return true;
        } else {
            return false;
        }
    }

    copy(targetBoardHasCells, sourceBoardHasCells){
        // Faster way.
        let boardInstance = this;
        let newBoard = new Board(this.sizeX, this.sizeY, targetBoardHasCells, boardInstance, sourceBoardHasCells);
        return newBoard;
    }

    drawWithOutCells(){
        // Creates a temporary Board with Cell's from a Board without Cell's.
        let targetBoardHasCells = true;
        let sourceBoardHasCells = false;
        let boardTmpDraw = this.copy(targetBoardHasCells, sourceBoardHasCells); 
        boardTmpDraw.draw();
    }

    static createBoardToDraw(){ 
        let targetBoardHasCells = true;
        let boardInstance = null;
        let sourceBoardHasCells = false
        let boardToDraw = new Board(MAX_X_ARRAY, MAX_Y_ARRAY, targetBoardHasCells, boardInstance, sourceBoardHasCells);
        return boardToDraw;
    }

    static createBoardWithOutCells(){ 
        let targetBoardHasCells = false;
        let boardInstance = null;
        let sourceBoardHasCells = false
        let boardWithOutCells = new Board(MAX_X_ARRAY, MAX_Y_ARRAY, targetBoardHasCells, boardInstance, sourceBoardHasCells);
        return boardWithOutCells;
    }
}

class Solver{
    constructor(board, wordList) {
        this.board = board;
        this.wordList = [...wordList];
        this.bestSolution = [-1, null] // [score, solution];
    }

    // Algorithm to generate a crossword
    // https://stackoverflow.com/questions/943113/algorithm-to-generate-a-crossword
    generateBoard(){
        // Makes a copy of inWordList.
        const wordList = [...this.wordList];

        // 1. Sort all the words by length, descending.
        wordList.sort(function(a, b){
            // ASC  -> a.length - b.length
            // DESC -> b.length - a.length
            return b.length - a.length;
          });

        console.log("wordList:");
        console.log(wordList);  

        let targetBoardHasCells = false
        let sourceBoardHasCells = false  
        let state      = this.board.copy(targetBoardHasCells, sourceBoardHasCells);
        let stateHoriz = this.board.copy(targetBoardHasCells, sourceBoardHasCells);
        let stateVert  = this.board.copy(targetBoardHasCells, sourceBoardHasCells);
        let prevScore = 0;
        this.solve(state, stateHoriz, stateVert, wordList, prevScore)

        // Print the best score one.
        console.log('Best solution: ');
        console.log(this.bestSolution); 
    }

    solve(state, stateHoriz, stateVert, wordList, prevScore){
        // Establish the stopping GOAL. 
        if (wordList.length == 0) {
            return;
        }

        let currWord    = wordList[0];            // Get's first word from the list.
        let newWordList = wordList.slice(1);      // Creates a copy the array without the first element of the list.

        let newState      = null;
        let newStateHoriz = null;
        let newStateVert  = null;
        
        let orientation   = null;

        let valid = false;
        let currX = 0;
        let currY = 0;
        let newX = 0;
        let newY = 0;
        let partialScore = 0;
        
        let hasNotFinished = true;
        while(hasNotFinished){
            // Give all the CHOICES to experiment incrementally/sequentially.
            // Validate choice against CONSTRAINS.
            // Updates de next position to search.
            [valid, currX, currY, newX, newY, orientation, partialScore] = this.getNextValidPosition(newX, newY,
                                                             state, stateHoriz, stateVert, currWord, orientation);
            if (valid == false){
                hasNotFinished = false;
                break;
            }

            newState = state.copy(false, false);
            newStateHoriz = stateHoriz.copy(false, false);
            newStateVert  = stateVert.copy(false, false);
        
            if (orientation === HORIZONTAL){
                newState.setWordHorizontal(currX, currY, currWord);
                newStateHoriz.setWordHorizontalGuard(currX, currY, currWord);
            } else {
                newState.setWordVertical(currX, currY, currWord);
                newStateVert.setWordVerticalGuard(currX, currY, currWord); 
            }
            // Score the state.
            let score = prevScore + partialScore;
            // Establish the stopping GOAL.
            if (newWordList.length == 0){
                let bestScore = this.bestSolution[0];
                if (score > bestScore){
                    let bestStateBoard = newState.copy(false, false)
                    let bestStateHoriz = newStateHoriz.copy(false, false)
                    let bestStateVert  = newStateVert.copy(false, false)
                    this.bestSolution = [score, bestStateBoard, newStateHoriz, newStateVert];
                    bestStateBoard.drawWithOutCells();
                    // newStateHoriz.drawWithOutCells();
                    // newStateVert.drawWithOutCells();
                }
                continue;
            }
            this.solve(newState, newStateHoriz, newStateVert, newWordList, score);
            // Give all the CHOICES to experiment incrementally.
            newState = state.copy(false, false);  // State copy
        }
    }  

    // Give all the CHOICES to experiment incrementally/sequentially.
    // Validate choice against CONSTRAINS.
    // Updates de next position to search.
    //   [valid, currX, currY, newX, newY, orientation, partialScore] = getNextValidPosition(newX, newY,
    //                                   state, stateHorizontal,stateVertical, currWord, lastOrientation);
    getNextValidPosition(inX, inY, state, stateHoriz, stateVert, currWord, lastOrientation){
        let valid = false;
        let currX = -1;
        let currY = -1;
        let newX = -1;
        let newY = -1;
        let partialScore = 0;

        let x = -1;
        let y = -1;
        let res = null;
        let flagBreak = false;
        if (lastOrientation == VERTICAL){
            inY = inY + 1;
            lastOrientation = null;
        }
        let currPosLetter = null;
        for (y = inY; y < state.sizeY; y++) { 
            for (x = inX; x < state.sizeX; x++) {
                // Simple first test, to see if the position can be used, and cut the processing weight.
                // We will see if the position is not Empty and if it has a different letter then our first letter.
                currPosLetter = state.board[x][y];
                if ( (currPosLetter != EMPTY) && currPosLetter != currWord[0] ){
                    continue;
                }
                if ((lastOrientation == null) || (lastOrientation != HORIZONTAL)){
                    // Generate Horizontally placement.
                    lastOrientation = HORIZONTAL;
                    // Test if word can fit horizontally until the end.
                    if (x < state.sizeX - currWord.length){
                        [res, partialScore] = this.canWordBePlacedHorizontal(x, y, state, stateHoriz, stateVert, currWord);
                        if (res == true){
                            flagBreak = true;
                            break;
                        }
                    }
                }
                if (lastOrientation == HORIZONTAL){
                    // Generate Vertical placement.
                    lastOrientation = VERTICAL;
                    // Test if word can fit vertically until the bottom.
                    if (y < state.sizeY - currWord.length){
                        [res, partialScore] = this.canWordBePlacedVertical(x, y, state, stateHoriz, stateVert, currWord);
                        if (res == true){
                            flagBreak = true;
                            break;
                        }
                    }
                 }
            }
            if (flagBreak)
                break;
        }

        if ((res != null) && (res == true)){
            valid = true;
            currX = x;
            currY = y;
            newX = x;
            newY = y;
        }

        return [valid, currX, currY, newX, newY, lastOrientation, partialScore];
    }

    // [res, partialScore] = canWordBePlacedHorizontal(x, y, state, stateHoriz, stateVert, currWord) 
    canWordBePlacedHorizontal(x, y, state, stateHoriz, stateVert, word){
        let result       = false;
        let partialScore = 0;

        // Test if we can put the word at x, y, Horizontal.
        
        // Test if the star and end position are over invalid state value terminate early.
        let endX = x + word.length - 1;
        if ((stateHoriz.board[x][y]    == NO_CURR_ORIENT_AND_START_NO_END_OTHER) ||
            (stateVert.board[x][y]     == NO_CURR_ORIENT_AND_START_NO_END_OTHER) ||
            (stateHoriz.board[x][y]    == NO_HORIZ_NO_VERT)                      ||
            (stateVert.board[x][y]     == NO_HORIZ_NO_VERT)                      ||
            
            (stateHoriz.board[endX][y] == NO_CURR_ORIENT_AND_START_NO_END_OTHER) ||
            (stateVert.board[endX][y]  == NO_CURR_ORIENT_AND_START_NO_END_OTHER) ||
            (stateHoriz.board[endX][y] == NO_HORIZ_NO_VERT)                      ||
            (stateVert.board[endX][y]  == NO_HORIZ_NO_VERT)                         ){
            
            result       = false;
            partialScore = 0;
            return [result, partialScore];        
        }
        // Test if the word clash's with the Horizontal constrains, for all positions of the previous words placed.
        for (let i = 0; i < word.length; i++) {
            let xi = x + i; 
            if ((stateHoriz.board[xi][y]  == HORIZONTAL)                             ||
                (stateHoriz.board[xi][y]  == NO_HORIZ_NO_VERT)                       ||
                (stateVert.board[xi][y]   == NO_HORIZ_NO_VERT)                       ||
                (stateHoriz.board[xi][y]  == NO_CURR_ORIENT_AND_START_NO_END_OTHER)  ||
                ( (state.board[xi][y] != EMPTY) && (state.board[xi][y] != word[i]))    ){

                result       = false;
                partialScore = 0;
                return [result, partialScore];
            }
            // Calculate the partial score of this move based on the number of crosses between words.
            if ((state.board[xi][y] != EMPTY) && (state.board[xi][y] == word[i])){
                partialScore = partialScore + 1;
            }
        }
        
        result = true;
        return [result, partialScore];
    }
    
    // [res, partialScore] = canWordBePlacedVertical(x, y, state, stateHoriz, stateVert, currWord) 
    canWordBePlacedVertical(x, y, state, stateHoriz, stateVert, word){
        let result       = false;
        let partialScore = 0;

        // Test if we can put the word at x, y, Vertical.
        
        // Test if the star and end position are over invalid state value terminate early.
        let endY = y + word.length - 1;
        if ((stateHoriz.board[x][y]    == NO_CURR_ORIENT_AND_START_NO_END_OTHER) ||
            (stateVert.board[x][y]     == NO_CURR_ORIENT_AND_START_NO_END_OTHER) ||
            (stateHoriz.board[x][y]    == NO_HORIZ_NO_VERT)                      ||  
            (stateVert.board[x][y]     == NO_HORIZ_NO_VERT)                      ||  

            (stateHoriz.board[x][endY] == NO_CURR_ORIENT_AND_START_NO_END_OTHER) ||
            (stateVert.board[x][endY]  == NO_CURR_ORIENT_AND_START_NO_END_OTHER) ||
            (stateHoriz.board[x][endY] == NO_HORIZ_NO_VERT)                      ||     
            (stateVert.board[x][endY]  == NO_HORIZ_NO_VERT)                         ){
            
            result       = false;
            partialScore = 0;
            return [result, partialScore];        
        }
        // Test if the word clash's with the Vertical constrains, for all positions of the previous words placed.
        for (let i = 0; i < word.length; i++) {
            let yi = y + i; 
            if ((stateVert.board[x][yi]   == VERTICAL)                               ||
                (stateVert.board[x][yi]   == NO_HORIZ_NO_VERT)                       ||
                (stateHoriz.board[x][yi]  == NO_HORIZ_NO_VERT)                       ||
                (stateVert.board[x][yi]   == NO_CURR_ORIENT_AND_START_NO_END_OTHER)  ||
                ( (state.board[x][yi] != EMPTY) && (state.board[x][yi] != word[i]))  ){

                result       = false;
                partialScore = 0;
                return [result, partialScore];
            }
            // Calculate the partial score of this move based on the number of crosses between words.
            if ((state.board[x][yi] != EMPTY) && (state.board[x][yi] == word[i])){
                partialScore = partialScore + 1;
            }
        }
        
        result = true;
        return [result, partialScore];
    }

}

let test_001 = () => {
    // Test 1:
    // Description: Test to the Board.Copy() and to the setWordHorizontalGuard(). 
    let targetBoardHasCells = true;
    let boardInstance = null;
    let sourceBoardHasCells = false
    let cwBoard = new Board(MAX_X_ARRAY, MAX_Y_ARRAY, targetBoardHasCells, boardInstance, sourceBoardHasCells);
    
    // cwBoard.setWordHorizontal(2, 2, 'A')

    console.log('After cwBoard creation!');

    cwBoard.draw();

    targetBoardHasCells = false;
    sourceBoardHasCells = true;
    let boardHoriz = cwBoard.copy(targetBoardHasCells, sourceBoardHasCells);
    boardHoriz.setWordHorizontalGuard(1, 2, 'BATATAS');
    
    console.log('After boardHoriz creation!');

    targetBoardHasCells = true;
    sourceBoardHasCells = false;
    let boardHorizDraw = boardHoriz.copy(targetBoardHasCells, sourceBoardHasCells); 
    boardHorizDraw.draw();

    console.log('After boardHorizDraw creation!');
}

let test_002 = () => {
    // Test 2:
    // Description: Test to the setWordVerticalGuard(). 
    let targetBoardHasCells = true;
    let boardInstance = null;
    let sourceBoardHasCells = false
    let cwBoard = new Board(MAX_X_ARRAY, MAX_Y_ARRAY, targetBoardHasCells, boardInstance, sourceBoardHasCells);
    
    // cwBoard.setWordHorizontal(2, 2, 'A')

    console.log('After cwBoard creation!');

    cwBoard.draw();

    targetBoardHasCells = false;
    sourceBoardHasCells = true;
    let boardVert = cwBoard.copy(targetBoardHasCells, sourceBoardHasCells);
    boardVert.setWordVerticalGuard(0, 2, 'CEMELHAS');
    
    console.log('After boardVert creation!');

    targetBoardHasCells = true;
    sourceBoardHasCells = false;
    let boardVertDraw = boardVert.copy(targetBoardHasCells, sourceBoardHasCells); 
    boardVertDraw.draw();

    console.log('After boardVertDraw creation!');
}

let test_003 = () => {
    // Test 3:
    // Description: 
    //      Test to the getNextValidPosition(newX, newY, state, stateHorizontal,stateVertical, currWord). 
    //      This method, has to:
    //          -Give all the CHOICES to experiment incrementally/sequentially.
    //          -Validate choice against CONSTRAINS.
    //          -Updates de next position to start search in the next step.
    //
    //       [valid, currX, currY, newX, newY, orientation, partialScore] = 
    //              getNextValidPosition(newX, newY, state, stateHorizontal,stateVertical, currWord);
    //
    //  Test: To test, comment the code after each console.log() with /* */ .


    // Create the Empty state to solve.
    let stateBoard = Board.createBoardWithOutCells()
    stateBoard.setWordHorizontal(1, 4, 'Bla')
    //stateBoard.setWordVertical(2, 0, 'Cbli')
    stateBoard.drawWithOutCells();
    console.log('After stateBoard creation!');
    
    // Create the stateHoriz.
    let stateHoriz = Board.createBoardWithOutCells()
    stateHoriz.setWordHorizontalGuard(1, 4, 'Bla')
    // stateHoriz.drawWithOutCells();
    console.log('After stateHoriz creation!');

    // Create the stateVert.
    let stateVert = Board.createBoardWithOutCells()
    stateVert.setWordVerticalGuard(2, 0, 'Cbli')
    // stateVert.drawWithOutCells();
    console.log('After stateVert creation!');

    let wordList = ['apple', 'car', 'computer', 'battery', 'transistor' ];

    let solver = new Solver(stateBoard, wordList);
    
    let x = 2;  // 2;
    let y = 0;  // 3;
    let currWord = 'Cbli';
    let lastOrientation = HORIZONTAL; // null;

    let res = solver.getNextValidPosition(x, y, stateBoard, stateHoriz, stateVert, currWord, lastOrientation);
    let [valid, currX, currY, newX, newY, orientation, partialScore] = res;
    console.log("[valid, currX, currY, newX, newY, orientation, partialScore]");
    console.log(res);
    if (valid){
        if (orientation == HORIZONTAL){
            stateBoard.setWordHorizontal(currX, currY, currWord);
            stateHoriz.setWordHorizontalGuard(currX, currY, currWord);
        } else {
            stateBoard.setWordVertical(currX, currY, currWord);
            stateVert.setWordVerticalGuard(currX, currY, currWord);
        }
        stateBoard.drawWithOutCells();
    }
}

let test_004 = () => {
    // Test 4:
    // Description: 
    //      Test to the solve(state, stateHorizontal, stateVertical, wordList, prevScore) 
    //      This method, has to:
    //          -Search with BackTracking .
    //          -Maximize the score pointes while maintaining within the constrains.
    //
    //  Test: To test, comment the code after each console.log() with /* */ .


    // Create the Empty state to solve.
    let stateBoard = Board.createBoardWithOutCells()
    // stateBoard.setWordHorizontal(2, 2, 'Bla')
    // stateBoard.setWordVertical(2, 1, 'cbli')
    stateBoard.drawWithOutCells();
    console.log('After stateBoard creation!');
    
    // Create the stateHoriz.
    let stateHoriz = Board.createBoardWithOutCells()
    // stateHoriz.setWordHorizontalGuard(2, 2, 'bla')
    stateHoriz.drawWithOutCells();
    console.log('After stateHoriz creation!');

    // Create the stateVert.
    let stateVert = Board.createBoardWithOutCells()
    // stateVert.setWordVerticalGuard(2, 1, 'cbli')
    stateVert.drawWithOutCells();
    console.log('After stateVert creation!');

    let wordList = [ 'apple', 'car', 'computer', 'battery', 'transistor', 'terminal' ];

    let solver = new Solver(stateBoard, wordList);
    
    solver.generateBoard()
    
    //let prevScore = 0;
    //solver.solve(stateBoard, stateHoriz, stateVert, wordList, prevScore);
    console.log("solver.bestSolution:");
    console.log(solver.bestSolution);
    let bestStateBoard      = solver.bestSolution[1];
    let bestStateBoardHoriz = solver.bestSolution[2];
    let bestStateBoardVert  = solver.bestSolution[3];
    
    if (bestStateBoard != null){
        bestStateBoard.drawWithOutCells();
        // bestStateBoardHoriz.drawWithOutCells();
        // bestStateBoardVert.drawWithOutCells();
    }
}

/*
 window.onload = () => {
    // test_001( );
    // test_002( );
    // test_003( );
     test_004( );
}
*/

function init() {
    // window.addEventListener("keydown",doKeyDown,false);
    // timer=setInterval(draw, 10);
    // return timer;

    // test_001( );
    // test_002( );
    // test_003( );
    test_004( );
    
    console.log('...end.');
}

function startCrosswordsMaker(wordList){
       // Create the Empty state to solve.
       let stateBoard = Board.createBoardWithOutCells()
       // stateBoard.drawWithOutCells();
       
       // Create the stateHoriz.
       let stateHoriz = Board.createBoardWithOutCells()
       // stateHoriz.drawWithOutCells();
      
       // Create the stateVert.
       let stateVert = Board.createBoardWithOutCells()
       // stateVert.drawWithOutCells();
   
       // let wordList = [ 'apple', 'car', 'computer', 'battery', 'transistor', 'terminal' ];
       let solver = new Solver(stateBoard, wordList);
       solver.generateBoard()
       
       let bestStateBoard      = solver.bestSolution[1];
       // let bestStateBoardHoriz = solver.bestSolution[2];
       // let bestStateBoardVert  = solver.bestSolution[3];
       
       if (bestStateBoard != null){
           bestStateBoard.drawWithOutCells();
           // bestStateBoardHoriz.drawWithOutCells();
           // bestStateBoardVert.drawWithOutCells();
       } else {
            // Puzzle not found.
            // Draw "Couldn't generate puzzle..."
            let canvas = document.getElementById("crosswordsCanvas");
            let ctx = canvas.getContext("2d");
            // Clears the canvas for redrawing.
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = LETTER_FONT;
            ctx.fillStyle = "#0000FF"; // Blue
            ctx.fillText("Couldn't generate puzzle...", 20,  220);
       }
}

const myForm = document.getElementById('myForm');

const input_01 = document.querySelector('#input_01');
const input_02 = document.querySelector('#input_02');
const input_03 = document.querySelector('#input_03');
const input_04 = document.querySelector('#input_04');
const input_05 = document.querySelector('#input_05');
const input_06 = document.querySelector('#input_06');
const input_07 = document.querySelector('#input_07');
const input_08 = document.querySelector('#input_08');
const input_09 = document.querySelector('#input_09');
const input_10 = document.querySelector('#input_10');

const input_01_error = document.querySelector('#input_01_error');
const input_02_error = document.querySelector('#input_02_error');
const input_03_error = document.querySelector('#input_03_error');
const input_04_error = document.querySelector('#input_04_error');
const input_05_error = document.querySelector('#input_05_error');
const input_06_error = document.querySelector('#input_06_error');
const input_07_error = document.querySelector('#input_07_error');
const input_08_error = document.querySelector('#input_08_error');
const input_09_error = document.querySelector('#input_09_error');
const input_10_error = document.querySelector('#input_10_error');


function testField(inputField, inputError){
    let len = inputField.value.length;
    if (len === 0){
        return ["", false];
    } else if (len < 3){
        inputError.innerHTML = "Error: Word has to have more then 2 characters."
        // Callback function in timeout, that erases the error message.
        setTimeout( () => inputError.innerHTML = "", 3000);
    } else if (len > 10){
        inputError.innerHTML = "Error: Word has to be less then 10 characters."
        // Callback function in timeout, that erases the error message.
        setTimeout( () => inputError.innerHTML = "", 3000);
    } else if (len != 0) {
        return [inputField.value, false];
    }
    return ["", true];
}

function testFieldsAndGetList(){
    // 1 - Test's if string are longer then 10 characters.
    // 2 - Only copies to the list the strings that are not empty.
    // 3 - Writes the error message in case of error. 
    let wordList = [];
    let errorInputValues = false;
    // 1 - Test's if string are longer then 10 characters.
    wordList = [testField(input_01, input_01_error),
                testField(input_02, input_02_error),
                testField(input_03, input_03_error),
                testField(input_04, input_04_error),
                testField(input_05, input_05_error),
                testField(input_06, input_06_error),
                testField(input_07, input_07_error),
                testField(input_08, input_08_error),
                testField(input_09, input_09_error),
                testField(input_10, input_10_error) ];
    // 2 - Only copies to the list the strings that are not empty.
    let listErrors = wordList.filter((item)=>{
        return item[1] === true;
    }); 
    if (listErrors.length != 0){
        errorInputValues = true;
    }
    // Filters all the string that have zero length.
    wordList = wordList.filter((item)=>{
        return item[0].length > 0;
    });
    // Get's the string to the upper level.
    wordList = wordList.map((item)=>{
        return item[0];
    });
    if (wordList.length == 0){
        errorInputValues = true
    }
    return [wordList, errorInputValues]
}

function onSubmit(e){
    e.preventDefault();
    let [wordList, errorInputValues] = testFieldsAndGetList()
    if (errorInputValues === false){
        // Starts the crosswords puzzle maker.

        // Draw "Generating puzzle..."
        let canvas = document.getElementById("crosswordsCanvas");
        let ctx = canvas.getContext("2d");
        // Clears the canvas for redrawing.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = LETTER_FONT;
        ctx.fillStyle = "#0000FF"; // Blue
        ctx.fillText("Generating puzzle...", 20,  220);

        // Callback function in timeout, that really starts.
        setTimeout( () => startCrosswordsMaker(wordList), 100);
    }
}

// Add's the event listener.
myForm.addEventListener('submit', onSubmit);


/* @flow */

type CellControl = { octopus: () => void 
                   , unOctopus: () => void
                   , sad: () => void
                   , unSad: () => void
                   }

type Coord = { row : number, col: number }

type ClickWatcher = ((row : number, col : number) => void)

type GameBoard = { div: HTMLDivElement
                 , controls: ((row : number, col : number) => CellControl)
                 , onNextClick: (watcher: ClickWatcher) => void
                 }

type Color = 'B' | 'W' | 'G';

type Segment = { start: Coord, length: number, direction: Coord }

type Program = Array<Segment>

const COL_MAX = 12; const ROW_MAX = 14;

let logo = ([["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"]
            ,["B", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "B"]
            ,["B", "W", "B", "B", "B", "B", "B", "B", "B", "B", "W", "B"]
            ,["B", "W", "G", "B", "G", "B", "G", "B", "B", "B", "W", "B"]
            ,["B", "W", "B", "B", "B", "B", "B", "B", "B", "B", "W", "B"]
            ,["B", "W", "B", "G", "G", "B", "G", "G", "B", "B", "W", "B"]
            ,["B", "W", "B", "B", "B", "B", "B", "B", "B", "B", "W", "B"]
            ,["B", "W", "B", "B", "B", "B", "B", "B", "B", "B", "W", "B"]
            ,["B", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "B"]
            ,["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"]
            ,["W", "W", "W", "W", "B", "B", "B", "B", "W", "W", "W", "W"]
            ,["W", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "W"]
            ,["B", "B", "B", "W", "B", "W", "B", "W", "B", "W", "B", "B"]
            ,["B", "B", "W", "B", "W", "B", "W", "B", "W", "B", "B", "B"]
            ,["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"]
            ] : Array<Array<'B'|'W'|'G'>>);

let introMessage = ["The octopus likes to hide.", "Where will they hide next?", "Perhaps you can find them!"]
           
function getProgram(program : Program) : Array<Coord> {
    let r : Array<Coord> = [];
    program.forEach((segment) => {
        let current = segment.start;
        for (let i = 0; i < segment.length; i++) {
            r.push(current);
            current = { row: current.row + segment.direction.row, col: current.col + segment.direction.col };
        }
    });
    return r;
}

let programs = ([ [{ start: { row: 0, col: 0 }, length: 6, direction: { row: 0, col: 1 } }]
                , [{ start: { row: 0, col: 0 }, length: 5, direction: { row: 0, col: 2 } }]
                , [{ start: { row: 0, col: 0 }, length: 1, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 0, col: 1 }, length: 1, direction: { row: 0, col: 2 } }
                  ,{ start: { row: 0, col: 3 }, length: 1, direction: { row: 0, col: 2 } }
                  ,{ start: { row: 0, col: 6 }, length: 1, direction: { row: 0, col: 2 } }
                  ,{ start: { row: 0, col: 10 }, length: 1, direction: { row: 0, col: 2 } }]
                , [{ start: { row: 0, col: 0 }, length: 6, direction: { row: 1, col: 0 } }]
                , [{ start: { row: 0, col: 7 }, length: 5, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 1, col: 0 }, length: 12, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 2, col: 0 }, length: 1, direction: { row: 0, col: 1 } }]
                , [{ start: { row: 2, col: 2 }, length: 2, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 3, col: 3 }, length: 2, direction: { row: 1, col: 0 } }
                  ,{ start: { row: 4, col: 3 }, length: 3, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 5, col: 5 }, length: 1, direction: { row: 1, col: 0 } }]
                , [{ start: { row: 1, col: 0 }, length: 1, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 1, col: 11 }, length: 1, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 2, col: 0 }, length: 1, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 2, col: 11 }, length: 1, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 3, col: 0 }, length: 1, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 3, col: 11 }, length: 1, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 4, col: 0 }, length: 1, direction: { row: 0, col: 1 } }
                  ,{ start: { row: 4, col: 11 }, length: 1, direction: { row: 0, col: 1 } }]
                ] : Array<Program>)

function createCell(document : Document, color : 'B' | 'W' | 'G', clickHandler: () => void) : { div: HTMLDivElement, control: CellControl} {
    let div = document.createElement("div");
    div.classList.add('pixel');
    div.classList.add(`pixel-color-${color}`);
    div.addEventListener('click', clickHandler);
    return { 
        div, 
        control: {
            octopus: () => div.classList.add('octopus'),
            unOctopus: () => div.classList.remove('octopus'),
            sad: () => div.classList.add('sad'),
            unSad: () => div.classList.remove('sad')
        }
    };
}


function createDivs(document : Document) : GameBoard  {
    let clickWatchers : Array<ClickWatcher> = [];

    function handleClick(row, col) {
        clickWatchers.forEach((clickWatcher) => {
            clickWatcher(row, col);
        });
        clickWatchers = [];
    }

    let rows = logo.map((logoRow, rowIndex) => {
        let cells = logoRow.map((cellColor, colIndex) => createCell(document, cellColor, () => handleClick(rowIndex, colIndex)));
        let div = document.createElement("div");
        div.classList.add('row');
        cells.forEach((cell) => div.appendChild(cell.div));
        return { div, cells };
    })
    let div = document.createElement("div");
    rows.forEach((row) => div.appendChild(row.div));



    return {
        div,
        controls: (row, col) => rows[row].cells[col].control,
        onNextClick: (watcher: ClickWatcher) => { 
            clickWatchers.push(watcher);
        }
    };
}

function runProgram(divs : GameBoard, program : Array<Coord>, index: number, retry: () => void, nextLevel: () => void) {
    if (index >= program.length) {
        return;
    }
    if (index == program.length - 1) {
        waitForSolution(divs, program[index], retry, nextLevel);
    } else {
        divs.controls(program[index].row, program[index].col).octopus();
        setTimeout(() => {
            divs.controls(program[index].row, program[index].col).unOctopus();
            runProgram(divs, program, index + 1, retry, nextLevel)
        }, 200);
    }
}

function waitForSolution(divs : GameBoard, solution: Coord, retry: () => void, nextLevel: () => void) {
    divs.onNextClick((row, col) => {
        if (row === solution.row && col == solution.col) {
            divs.controls(row, col).octopus();
            setTimeout(() => {
                divs.controls(row, col).unOctopus();
                nextLevel();
            }, 200);
        } else {
            divs.controls(row, col).sad();
            setTimeout(() => {
                divs.controls(row, col).unSad();
                retry();
            }, 200);
        }
    })
}

function runLevel(divs, level) {
    let program = programs[level];
    if (program) {
        runProgram(divs, getProgram(program), 0, () => runLevel(divs, level), () => runLevel(divs, level + 1));
    } else {
        alert('you win!');
    }
}
function gameBoard(document) : GameBoard {
    let divs = createDivs(document);
    runLevel(divs, 0);
    return divs;
}

function showIntroMessage(cell : HTMLElement) : void {
    cell.innerHTML = '<ul>' + introMessage.map((line) => '<li>' + line + '</li>').join('') + '</ul>'
}

document.addEventListener("DOMContentLoaded", (ready) => {
    let host = document.getElementById('host');
    if (host) {
        showIntroMessage(host);
        let startGame = () => {
            Array.prototype.forEach.call(host.childNodes, (child) => host.removeChild(child));
            let board = gameBoard(document);
            host.appendChild(board.div);
            host.removeEventListener('click', startGame);
        };
        host.addEventListener("click", startGame);
    }
});

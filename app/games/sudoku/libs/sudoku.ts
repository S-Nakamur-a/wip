// 数独の問題をランダムに生成する関数
export type Suuji = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SuujiWithBlank = Suuji | 0;
export type Answers = {[K in Suuji]: boolean}

export type Row<T> = [T, T, T, T, T, T, T, T, T];
export type Block<T> = [[T, T, T], [T, T, T], [T, T, T]];
export type SudokuBoard<T> = [Row<T>, Row<T>, Row<T>, Row<T>, Row<T>, Row<T>, Row<T>, Row<T>, Row<T>];

export type CompletedBoardType = SudokuBoard<Suuji>;
export type IncompletedBoardType = SudokuBoard<SuujiWithBlank>;
export type UserAnswerBoardType = SudokuBoard<Answers>;


export const newUserAnswerBoard = (): UserAnswerBoardType => {
    const newAnswers = () => {return {1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false} as Answers};
    return [
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
        [newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers(), newAnswers()],
    ];
}

export const copyBoard = <T>(board: SudokuBoard<T>): SudokuBoard<T> => {
    return board.map(row => [...row]) as SudokuBoard<T>;
}

export const isEqualBoard = <T extends number>(a: SudokuBoard<T>, b: SudokuBoard<T>): boolean => {
    return a.every((row, i) => row.every((cell, j) => cell === b[i][j]));
}

const blankBoard: IncompletedBoardType = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const randomSuuji = (): Row<SuujiWithBlank> => {
    const row = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffled = row.map(n => ({ n, r: Math.random() })).sort((a, b) => a.r - b.r).map(({ n }) => n);
    if (shuffled.length === 9) {
        return shuffled as Row<Suuji>;
    }
    throw new Error("shuffled.length !== 9");
}

export const createRandomCompletedBoard = (): CompletedBoardType => {
    const board = copyBoard(blankBoard);
    
    // どれかの行もしくは列をランダムに埋める
    const random = randomSuuji();
    if (Math.random() < 0.5) {
        const randomRow = Math.floor(Math.random() * 9);
        for (let i = 0; i < 9; i++) {
            board[randomRow][i] = random[i];
        }
    } else {
        const randomCol = Math.floor(Math.random() * 9);
        for (let i = 0; i < 9; i++) {
            board[i][randomCol] = random[i];
        }
    }
    

    if (solve(board)) {
        return board as CompletedBoardType;
    } else {
        throw new Error('Failed to generate a completed Sudoku board.');
    }
}

export const isSafe = (board: IncompletedBoardType, y: number, x: number, num: Suuji): boolean => {
    // 同じ行に同じ数字があるか
    for (let dx = 0; dx < 9; dx++) {
        if (board[y][dx] === num) {
            return false;
        }
    }
    // 同じ列に同じ数字があるか
    for (let dy = 0; dy < 9; dy++) {
        if (board[dy][x] === num) {
            return false;
        }
    }
    // 同じブロックに同じ数字があるか
    const startY = y - y % 3;
    const startX = x - x % 3;
    for (let dy = 0; dy < 3; dy++) {
        for (let dx = 0; dx < 3; dx++) {
            if (board[startY + dy][startX +dx] === num) {
                return false;
            }
        }
    }
    return true;
}

export const isCompleted = (board: Readonly<IncompletedBoardType>): boolean => {
    for (let i = 0; i < 9; i++) {
        const row = board[i];
        const col = board.map(row => row[i]);
        if (new Set(row).size != 9 || new Set(col).size != 9) {
            return false;
        }
    }
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const block = board.slice(i * 3, i * 3 + 3).map(row => row.slice(j * 3, j * 3 + 3)).flat();
            if (new Set(block).size != 9) {
                return false;
            }
        }
    }
    return true;
}



const solve = (board: IncompletedBoardType): boolean => {
    const find = findBlank(board);
    if (find === null) {
        return isCompleted(board);
    }

    const [y, x] = find;
    const random = randomSuuji();

    for (const num of random) {
        const suuji = num as Suuji;
        if (isSafe(board, y, x, suuji)) {
            board[y][x] = suuji;
            if (solve(board)) {
                return true;
            }
            board[y][x] = 0;
        }
    }

    return false;
}

const findBlank = (board: IncompletedBoardType): [number, number] | null => {
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (board[y][x] === 0) {
                return [y, x];
            }
        }
    }
    return null;
}

const findRandomSuujiCell = (board: IncompletedBoardType): [number, number] | null => {
    const blankCells: [number, number][] = [];
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (board[y][x] !== 0) {
                blankCells.push([y, x]);
            }
        }
    }
    if (blankCells.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * blankCells.length);
    return blankCells[randomIndex];
}

export const createRandomSudokuProblem = (n: number): [IncompletedBoardType, CompletedBoardType] => {
    if (n < 10 || n > 100) {
        throw new Error("n should be between 10 and 100");
    }
    const completedBoard = createRandomCompletedBoard();
    let board = copyBoard(completedBoard) as IncompletedBoardType;

    // ランダムにセルを削除し、もう一度solveする。結果がcompletedBoardと一致しない場合はもう一度やり直す。
    let count = 0;
    while (count < n) {
        const pos = findRandomSuujiCell(board);
        if (pos) {
            const [y, x] = pos;
            const tmp = copyBoard(board);
            tmp[y][x] = 0;
            const answers = ultraFastSearchAllAnswers(tmp);
            if (answers.length === 1 && isEqualBoard(answers[0], completedBoard)) {
                board[y][x] = 0;
            }
        }
        count++;
    }

    return [board, completedBoard];
}

const ultraFastSearchAllAnswers = (board: IncompletedBoardType): CompletedBoardType[] => {
    const find = findBlank(board);
    if (find === null) {
        return [copyBoard(board) as CompletedBoardType];
    }

    const [y, x] = find;
    const answers: CompletedBoardType[] = [];

    for (let num = 1; num <= 9; num++) {
        const n = num as Suuji;
        if (isSafe(board, y, x, n)) {
            board[y][x] = n;
            answers.push(...ultraFastSearchAllAnswers(board));
            board[y][x] = 0;
        }
    }

    return answers;
}
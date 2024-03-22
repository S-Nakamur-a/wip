'use client';

import styles from './page.module.css';
import { SudokuBoard } from './components/board';
import { Difficulty, useSudokuBoard } from './hooks/useSudoku';

export default function Page() {
    const {board, setBoard, initialBoard, clear, checkClear, newGame, userAnswerBoard, setUserAnswerBoard} = useSudokuBoard();

    return (
        <div className="container">
            <h1>数独</h1>
            {board && initialBoard.current && <SudokuBoard initialBoard={initialBoard.current} board={board} setBoard={setBoard} checkClear={checkClear} userAnswerBoard={userAnswerBoard} setUserAnswerBoard={setUserAnswerBoard} />}
            {clear && <div className={styles.congraturations}>Congratulations!</div>}
            <NewGameComponent newGame={newGame} />
        </div>
    )
}

const NewGameComponent = ({newGame}: {newGame: (difficulty: Difficulty) => void}) => {
    return (
        <>
            <h2>New Game</h2>
            <div className={styles.sudoku_select_contianer}>
                <button className={`${styles.sudoku_select} ${styles.sudoku_easy}`} onClick={() => newGame("Easy")}>Easy</button>
                <button className={`${styles.sudoku_select} ${styles.sudoku_normal}`} onClick={() => newGame("Normal")}>Normal</button>
                <button className={`${styles.sudoku_select} ${styles.sudoku_hard}`} onClick={() => newGame("Hard")}>Hard</button>
            </div>
        </>
    )
}
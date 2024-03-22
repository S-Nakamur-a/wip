'use client';

import styles from './page.module.css';
import { SudokuBoard } from './components/board';
import { Difficulty, useSudokuBoard } from './hooks/useSudoku';

export default function Page() {
    const {board, setBoard, initialBoard, clear, checkClear, newGame, userAnswerBoard, setUserAnswerBoard, difficulty} = useSudokuBoard();

    return (
        <div className="container">
            <h1>数独</h1>
            {board && initialBoard.current && <SudokuBoard initialBoard={initialBoard.current} board={board} setBoard={setBoard} checkClear={checkClear} userAnswerBoard={userAnswerBoard} setUserAnswerBoard={setUserAnswerBoard} />}
            {clear && <div className={styles.congraturations}>Congratulations!</div>}
            <NewGameComponent newGame={newGame} difficulty={difficulty.current}/>
        </div>
    )
}

const NewGameComponent = ({newGame, difficulty}: {newGame: (difficulty: Difficulty) => void, difficulty: Difficulty}) => {
    return (
        <>
            <h2>New Game</h2>
            <div className={styles.sudoku_select_contianer}>
                <button className={`${styles.sudoku_select} ${styles.sudoku_easy} ${difficulty === "Easy" ? styles.selected : ""}`} onClick={() => newGame("Easy")}>Easy</button>
                <button className={`${styles.sudoku_select} ${styles.sudoku_normal} ${difficulty === "Normal" ? styles.selected : ""}`} onClick={() => newGame("Normal")}>Normal</button>
                <button className={`${styles.sudoku_select} ${styles.sudoku_hard} ${difficulty === "Hard" ? styles.selected : ""}`} onClick={() => newGame("Hard")}>Hard</button>
            </div>
        </>
    )
}
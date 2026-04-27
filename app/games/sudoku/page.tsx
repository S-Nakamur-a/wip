'use client';

import styles from './page.module.css';
import { SudokuBoard } from './components/board';
import { Difficulty, useSudokuBoard } from './hooks/useSudoku';

export default function Page() {
    const {board, setBoard, initialBoard, clear, checkClear, newGame, resetBoard, userAnswerBoard, setUserAnswerBoard, difficulty, isGenerating} = useSudokuBoard();

    const handleReset = () => {
        if (!clear && !window.confirm('現在の進行状況を初期状態に戻しますか？')) return;
        resetBoard();
    }
    const handleNewGame = (d: Difficulty) => {
        if (!clear && !window.confirm('現在の盤面を破棄して新しいゲームを始めますか？')) return;
        newGame(d);
    }

    return (
        <div className="container">
            <h1>数独</h1>
            {board && initialBoard.current && <SudokuBoard initialBoard={initialBoard.current} board={board} setBoard={setBoard} checkClear={checkClear} userAnswerBoard={userAnswerBoard} setUserAnswerBoard={setUserAnswerBoard} />}
            {isGenerating && (
                <div className={styles.loading}>
                    <span className={styles.spinner} aria-hidden />
                    生成中…
                </div>
            )}
            {clear && <div className={styles.congraturations}>Congratulations!</div>}
            <ResetComponent onReset={handleReset} />
            <NewGameComponent newGame={handleNewGame} difficulty={difficulty.current}/>
        </div>
    )
}

const ResetComponent = ({onReset}: {onReset: () => void}) => {
    return (
        <div className={styles.reset_container}>
            <button className={styles.reset_button} onClick={onReset} type="button">
                リセット
            </button>
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

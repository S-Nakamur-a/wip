'use client';

import { useState } from "react";
import { Answers, Block, IncompletedBoardType, Suuji, SuujiWithBlank, UserAnswerBoardType, copyBoard } from "../libs/sudoku";
import styles from './board.module.css';

type Props = {
    initialBoard: IncompletedBoardType,
    board: IncompletedBoardType,
    setBoard: (board: IncompletedBoardType) => void,
    checkClear: () => void,
    userAnswerBoard: UserAnswerBoardType,
    setUserAnswerBoard: (board: UserAnswerBoardType) => void,
}

type CellPos = { y: number; x: number }

export const SudokuBoard = ({ initialBoard, board, setBoard, checkClear, userAnswerBoard, setUserAnswerBoard }: Props) => {
    const [selected, setSelected] = useState<CellPos | null>(null)
    const [noteMode, setNoteMode] = useState<boolean>(false)

    const isProblemCell = (y: number, x: number) => initialBoard[y][x] !== 0

    const handleCellClick = (y: number, x: number) => {
        setSelected({ y, x })
    }

    const handleNumberTap = (n: Suuji) => {
        if (!selected) return
        const { y, x } = selected
        if (isProblemCell(y, x)) return

        const newUserAnswerBoard = copyBoard(userAnswerBoard)
        if (noteMode) {
            const cur = userAnswerBoard[y][x]
            newUserAnswerBoard[y][x] = { ...cur, [n]: !cur[n] }
        } else {
            newUserAnswerBoard[y][x] = blankAnswers()
            newUserAnswerBoard[y][x][n] = true
        }
        setUserAnswerBoard(newUserAnswerBoard)

        const inputAnswers = getInputAnswers(newUserAnswerBoard[y][x])
        const newValue: SuujiWithBlank = inputAnswers.length === 1 ? inputAnswers[0] : 0
        const newBoard = copyBoard(board)
        newBoard[y][x] = newValue
        setBoard(newBoard)
        if (newValue !== 0) checkClear()
    }

    const handleErase = () => {
        if (!selected) return
        const { y, x } = selected
        if (isProblemCell(y, x)) return

        const newUserAnswerBoard = copyBoard(userAnswerBoard)
        newUserAnswerBoard[y][x] = blankAnswers()
        setUserAnswerBoard(newUserAnswerBoard)

        const newBoard = copyBoard(board)
        newBoard[y][x] = 0
        setBoard(newBoard)
    }

    const isRelated = (y: number, x: number): boolean => {
        if (!selected) return false
        if (selected.y === y && selected.x === x) return false
        if (selected.y === y || selected.x === x) return true
        const by = Math.floor(selected.y / 3) * 3
        const bx = Math.floor(selected.x / 3) * 3
        return y >= by && y < by + 3 && x >= bx && x < bx + 3
    }

    return (
        <>
            <table className={styles.sudoku}>
                <tbody>
                    {board.map((row, y) => (
                        <tr key={y} className={styles.sudoku_row}>
                            {row.map((value, x) => {
                                const selectedHere = !!selected && selected.y === y && selected.x === x
                                const cellClass = [
                                    styles.sudoku_cell,
                                    isProblemCell(y, x) ? styles.problem_cell : styles.user_cell,
                                    selectedHere ? styles.selected : '',
                                    !selectedHere && isRelated(y, x) ? styles.related : '',
                                ].filter(Boolean).join(' ')
                                return (
                                    <td key={y * 9 + x} className={cellClass} onClick={() => handleCellClick(y, x)}>
                                        {isProblemCell(y, x)
                                            ? <div className={styles.cell_value}>{value}</div>
                                            : <UserCell value={value} answers={userAnswerBoard[y][x]} />}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <NumberPad
                noteMode={noteMode}
                onToggleNote={() => setNoteMode((m) => !m)}
                onNumber={handleNumberTap}
                onErase={handleErase}
                disabled={!selected || isProblemCell(selected.y, selected.x)}
            />
        </>
    )
}

const blankAnswers = (): Answers => ({
    1: false, 2: false, 3: false, 4: false, 5: false,
    6: false, 7: false, 8: false, 9: false,
})

const getInputAnswers = (ans: Answers): Suuji[] =>
    Object.entries(ans).filter(([_, v]) => v).map(([k]) => parseInt(k) as Suuji)

const UserCell = ({ value, answers }: { value: SuujiWithBlank; answers: Answers }) => {
    if (value !== 0) {
        return <div className={styles.cell_value}>{value}</div>
    }
    const inputAnswers = getInputAnswers(answers)
    if (inputAnswers.length === 0) {
        return <div />
    }
    const grid: Block<Suuji> = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    return (
        <div className={styles.candidate_grid}>
            {grid.flat().map((n) => (
                <div key={n} className={styles.candidate_cell}>
                    {answers[n] ? n : ''}
                </div>
            ))}
        </div>
    )
}

type NumberPadProps = {
    noteMode: boolean
    onToggleNote: () => void
    onNumber: (n: Suuji) => void
    onErase: () => void
    disabled: boolean
}

const NumberPad = ({ noteMode, onToggleNote, onNumber, onErase, disabled }: NumberPadProps) => {
    return (
        <div className={styles.numpad}>
            <div className={styles.numpad_actions}>
                <button
                    className={`${styles.numpad_action} ${noteMode ? styles.numpad_action_active : ''}`}
                    onClick={onToggleNote}
                    type="button"
                >
                    ✏️ 下書き
                </button>
                <button
                    className={styles.numpad_action}
                    onClick={onErase}
                    disabled={disabled}
                    type="button"
                >
                    ❌ 消す
                </button>
            </div>
            <div className={styles.numpad_row}>
                {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Suuji[]).map((n) => (
                    <button
                        key={n}
                        className={styles.numpad_button}
                        onClick={() => onNumber(n)}
                        disabled={disabled}
                        type="button"
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    )
}

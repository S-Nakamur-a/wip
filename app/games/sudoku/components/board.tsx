'use client';

import { useState, MouseEvent, useRef } from "react";
import { Answers, Block, IncompletedBoardType, Suuji, SuujiWithBlank, UserAnswerBoardType, copyBoard } from "../libs/sudoku";
import styles from './board.module.css';
import { ModalComponent } from "./modal";

type Props = {
    initialBoard: IncompletedBoardType,
    board: IncompletedBoardType,
    setBoard: (board: IncompletedBoardType) => void,
    checkClear: () => void,
    userAnswerBoard: UserAnswerBoardType,
    setUserAnswerBoard: (board: UserAnswerBoardType) => void,
}

export const SudokuBoard = ({ initialBoard, board, setBoard, checkClear, userAnswerBoard, setUserAnswerBoard}: Props) => {
    const setSuuji = (x: number, y: number, num: SuujiWithBlank) => {
            board[y][x] = num;
            setBoard(board);
            if (num !== 0) checkClear();
    }
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    return (
        <>
            <table className={styles.sudoku}>
                <tbody>
                    {board && board.map((row, y) => (
                    <tr key={y} className={styles.sudoku_row}>
                        {row.map((value, x) => (
                        <td className={styles.sudoku_cell} key={y*9+x}>
                            <Cell x={x} y={y} n={value} isProblem={initialBoard[y][x] === 0} setSuujiHandler={setSuuji} isGlobalModalOpen={isModalOpen} setIsGlobalModalOpen={setIsModalOpen} userAnswerBoard={userAnswerBoard} setUserAnswerBoard={setUserAnswerBoard}/>
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}



type CellProps = {
    x: number,
    y: number,
    n: SuujiWithBlank,
    isProblem: boolean,
    setSuujiHandler: (x: number, y: number, n: SuujiWithBlank) => void,
    isGlobalModalOpen: boolean,
    setIsGlobalModalOpen: (isOpen: boolean) => void,
    userAnswerBoard: UserAnswerBoardType,
    setUserAnswerBoard: (board: UserAnswerBoardType) => void,
}

export const Cell = (props: CellProps): JSX.Element => {
    // CellはModalに対して関数を渡しにいく必要がある
    return (
        <div className={styles.cell}>
            {props.isProblem ? ProblemCell({...props}) : FixedCell({ ...props })}
        </div>
    )
}


const ProblemCell = (props: Omit<CellProps, 'n'>) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModalHandler = (event: MouseEvent<HTMLDivElement>) => {
        if (props.isGlobalModalOpen) return
        setIsModalOpen(true)
        props.setIsGlobalModalOpen(true)
    }
    const closeModalHandler = () => {
        setIsModalOpen(false)
        props.setIsGlobalModalOpen(false)
    }

    const assumeHandler = (n: Suuji) => {
        const updatedUserAnswerBoard = copyBoard(props.userAnswerBoard);
        updatedUserAnswerBoard[props.y][props.x][n] = !updatedUserAnswerBoard[props.y][props.x][n];
        props.setUserAnswerBoard(updatedUserAnswerBoard);

        // answers の中で一つだけtrueの場合、その数字を回答にセットする
        // それ以外の場合は0をセットする
        const inputAnswers = getInputAnswers(updatedUserAnswerBoard[props.y][props.x])
        if (inputAnswers.length === 1) {
            props.setSuujiHandler(props.x, props.y, inputAnswers[0])
        } else {
            props.setSuujiHandler(props.x, props.y, 0)
        }
    }

    const answerHandler = (n: Suuji) => {
        // nだけtrueにして、それ以外をfalseにする
        const updatedUserAnswerBoard = copyBoard(props.userAnswerBoard);
        updatedUserAnswerBoard[props.y][props.x] = {
            1: false,
            2: false,
            3: false,
            4: false,
            5: false,
            6: false,
            7: false,
            8: false,
            9: false,
            [n]: true,
        }
        props.setUserAnswerBoard(updatedUserAnswerBoard);
        props.setSuujiHandler(props.x, props.y, n)
    }


    return (
        <>
            {isModalOpen && <ModalComponent answers={props.userAnswerBoard[props.y][props.x]} closeHandler={closeModalHandler} assumeHandler={assumeHandler} answerHandler={answerHandler}/>}
            <div onClick={openModalHandler} className={styles.blank_cell}>
                <InnerCell answers={props.userAnswerBoard[props.y][props.x]}/>
            </div>
        </>
    )
}

const getInputAnswers = (ans: Answers): Suuji[] => Object.entries(ans).filter(([_, value]) => value).map(([key, _]) => parseInt(key) as Suuji);

const InnerCell = (props: {answers: Answers}) => {
    const inputAnswers = getInputAnswers(props.answers)
    if (inputAnswers.length === 1) {
        return <div>{inputAnswers[0]}</div>
    } else if (inputAnswers.length > 1) {
        const cells: Block<Suuji> = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        return (
            <div className={styles.candidate_table}>
                {cells.map((row, i) => row.map((n, j) => <div  className={styles.candidate} key={j}>{props.answers[n] ? n : " "}</div>))}
            </div>
        )
    } else {
        return <div></div>
    }
}

type FixedCellProps = Pick<CellProps, 'n'>
const FixedCell = ({ n }: FixedCellProps) => {
    return (
        <div>
            {n}
        </div>
    )
}

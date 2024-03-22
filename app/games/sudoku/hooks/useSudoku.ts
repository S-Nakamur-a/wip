'use client';
import { useEffect, useRef, useState } from "react";
import { CompletedBoardType, IncompletedBoardType, UserAnswerBoardType, copyBoard, createRandomSudokuProblem, isEqualBoard, newUserAnswerBoard } from "../libs/sudoku";

export type Difficulty = "Easy" | "Normal" | "Hard";
type DifficultyLevel = {[K in Difficulty]: number};

export const useSudokuBoard = () => {
    const [board, setBoard] = useState<IncompletedBoardType>();
    const answerBoard = useRef<CompletedBoardType>();
    const initialBoard = useRef<IncompletedBoardType>();
    const [userAnswerBoard, setUserAnswerBoard] = useState<UserAnswerBoardType>(newUserAnswerBoard());
    const difficulty = useRef<Difficulty>("Easy");
    const [clear, setClear] = useState(false);

    const newGame = (d: Difficulty) => {
        difficulty.current = d;
        const difficultyLevel: DifficultyLevel = {
            "Easy": 30,
            "Normal": 40,
            "Hard": 100,
        }
    
        const [incompletedBoard, completedBoard] = createRandomSudokuProblem(difficultyLevel[d]);
        initialBoard.current = copyBoard(incompletedBoard);
        setBoard(incompletedBoard);
        answerBoard.current = completedBoard;
        setUserAnswerBoard(newUserAnswerBoard());
        setClear(false);
    }
    
    useEffect(() => {
        newGame(difficulty.current);
    }, [])

    const checkClear = () => {
        if (board && isEqualBoard(board, answerBoard.current!)) {
            setClear(true);
        } else {
            setClear(false);
        }
    }
    return { board, setBoard, initialBoard, clear, checkClear, newGame, userAnswerBoard, setUserAnswerBoard, difficulty };
}
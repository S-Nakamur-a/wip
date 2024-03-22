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

    const newGame = (difficulty: Difficulty) => {
        const difficultyLevel: DifficultyLevel = {
            "Easy": 30,
            "Normal": 40,
            "Hard": 100,
        }
    
        const [incompletedBoard, completedBoard] = createRandomSudokuProblem(difficultyLevel[difficulty]);
        initialBoard.current = copyBoard(incompletedBoard);
        setBoard(incompletedBoard);
        answerBoard.current = completedBoard;
        setUserAnswerBoard(newUserAnswerBoard());
    }
    
    useEffect(() => {
        newGame("Easy");
    }, [])

    const [clear, setClear] = useState(false);
    const checkClear = () => {
        if (board && isEqualBoard(board, answerBoard.current!)) {
            setClear(true);
        }
    }
    return { board, setBoard, initialBoard, clear, checkClear, newGame, userAnswerBoard, setUserAnswerBoard};
}
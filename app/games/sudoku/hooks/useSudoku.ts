'use client';
import { useEffect, useRef, useState } from "react";
import { CompletedBoardType, IncompletedBoardType, UserAnswerBoardType, copyBoard, createRandomSudokuProblem, isEqualBoard, newUserAnswerBoard } from "../libs/sudoku";

export type Difficulty = "Easy" | "Normal" | "Hard";
type DifficultyLevel = {[K in Difficulty]: number};

const STORAGE_KEY = 'sudoku:v1:state';

const isValidSavedState = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    if (data.v !== 1) return false;
    if (!Array.isArray(data.board) || data.board.length !== 9) return false;
    if (!Array.isArray(data.initialBoard) || data.initialBoard.length !== 9) return false;
    if (!Array.isArray(data.answerBoard) || data.answerBoard.length !== 9) return false;
    if (!Array.isArray(data.userAnswerBoard) || data.userAnswerBoard.length !== 9) return false;
    if (!['Easy', 'Normal', 'Hard'].includes(data.difficulty)) return false;
    return true;
}

export const useSudokuBoard = () => {
    const [board, setBoard] = useState<IncompletedBoardType>();
    const answerBoard = useRef<CompletedBoardType>();
    const initialBoard = useRef<IncompletedBoardType>();
    const [userAnswerBoard, setUserAnswerBoard] = useState<UserAnswerBoardType>(newUserAnswerBoard());
    const difficulty = useRef<Difficulty>("Easy");
    const [clear, setClear] = useState(false);
    const [hydrated, setHydrated] = useState(false);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        let loaded = false;
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
            if (raw) {
                const data = JSON.parse(raw);
                if (isValidSavedState(data)) {
                    initialBoard.current = data.initialBoard;
                    answerBoard.current = data.answerBoard;
                    difficulty.current = data.difficulty;
                    setBoard(data.board);
                    setUserAnswerBoard(data.userAnswerBoard);
                    setClear(!!data.clear);
                    loaded = true;
                }
            }
        } catch {
            // 不正データは無視
        }
        if (!loaded) {
            newGame(difficulty.current);
        }
        setHydrated(true);
    }, [])

    // 状態変化を都度 localStorage に保存
    useEffect(() => {
        if (!hydrated) return;
        if (!board || !initialBoard.current || !answerBoard.current) return;
        try {
            const data = {
                v: 1,
                board,
                initialBoard: initialBoard.current,
                answerBoard: answerBoard.current,
                userAnswerBoard,
                difficulty: difficulty.current,
                clear,
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            // 容量超過などは握り潰す
        }
    }, [board, userAnswerBoard, clear, hydrated]);

    const checkClear = () => {
        if (board && isEqualBoard(board, answerBoard.current!)) {
            setClear(true);
        } else {
            setClear(false);
        }
    }

    const resetBoard = () => {
        if (!initialBoard.current) return;
        setBoard(copyBoard(initialBoard.current));
        setUserAnswerBoard(newUserAnswerBoard());
        setClear(false);
    }

    return { board, setBoard, initialBoard, clear, checkClear, newGame, resetBoard, userAnswerBoard, setUserAnswerBoard, difficulty };
}
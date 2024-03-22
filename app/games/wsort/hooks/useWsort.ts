// hooks/useGameState.ts
import { useState, useEffect } from 'react'
import { GameStateClass } from '../models/GameStateClass'
import { BottleClass } from '../models/BottleClass'

function useGameState(initialParam: number) {
  const [gameState, setGameState] = useState<GameStateClass>(GameStateClass.empty())
  const [gameHistory, setGameHistory] = useState<GameStateClass[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)


  // 履歴から1手戻る機能
  const undoGameState = () => {
    if (currentHistoryIndex > 0) {
      const previousHistoryIndex = currentHistoryIndex - 1
      setCurrentHistoryIndex(previousHistoryIndex)
      setGameState(gameHistory[previousHistoryIndex])
    }
  }

  // ゲーム状態の更新と履歴の追加を行う関数
  const updateGameState = (newGameState: GameStateClass) => {
    const newGameStateCopy = {
      ...newGameState,
      bottles: newGameState.bottles.map((bottle) => {
        return new BottleClass([...bottle.waters])
      }),
      export: newGameState.export,
      import: newGameState.import,
    }
    const updatedHistory = gameHistory
      .slice(0, currentHistoryIndex + 1)
      .concat(newGameStateCopy)
    if (updatedHistory.length > 300) {
      updatedHistory.shift()
    }
    setGameHistory(updatedHistory)
    setCurrentHistoryIndex(updatedHistory.length - 1)
    setGameState(newGameStateCopy)
  }

  // ゲームをリセットする関数
  const resetGameState = () => {
    const initialState = gameHistory[0]
    setGameHistory([initialState])
    setGameState(initialState)
    setCurrentHistoryIndex(0)
  }

  // 新しいゲームを開始する関数
  const startNewGame = (newColorNumber: number) => {
    const initialState = GameStateClass.random(newColorNumber)
    setGameHistory([initialState])
    setGameState(initialState)
    setCurrentHistoryIndex(0)
  }

    // ゲームの初期状態を設定し、履歴に追加
    useEffect(() => {
        startNewGame(initialParam)
    }, [initialParam])

    // 指定された状態にゲームをセットする関数（履歴はリセットする）
    const setGameStateAndResetHistory = (newGameState: GameStateClass) => {
      setGameHistory([newGameState])
      setGameState(newGameState)
      setCurrentHistoryIndex(0)
    }


  return {
    gameState,
    updateGameState,
    undoGameState,
    resetGameState,
    startNewGame,
    setGameStateAndResetHistory,
  }
}

export default useGameState

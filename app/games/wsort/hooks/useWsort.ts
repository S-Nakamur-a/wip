// hooks/useGameState.ts
import { useState, useEffect } from 'react'
import { GameStateClass } from '../models/GameStateClass'
import { BottleClass } from '../models/BottleClass'

const STORAGE_KEY = 'wsort:v1:state'

function useGameState(initialParam: number) {
  const [gameState, setGameState] = useState<GameStateClass>(GameStateClass.empty())
  const [gameHistory, setGameHistory] = useState<GameStateClass[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hydrated, setHydrated] = useState(false)


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

  // 新しいゲームを開始する関数。重い乱数生成は setTimeout で yield して
  // 「生成中」表示が描画されてから実行されるようにする。
  const startNewGame = (newColorNumber: number) => {
    setIsGenerating(true)
    setTimeout(() => {
      const initialState = GameStateClass.random(newColorNumber)
      setGameHistory([initialState])
      setGameState(initialState)
      setCurrentHistoryIndex(0)
      setIsGenerating(false)
    }, 0)
  }

    // 初期マウント時に localStorage から復元。失敗時は新規生成。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        let loaded = false
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
            if (raw) {
                const data = JSON.parse(raw)
                if (
                    data && data.v === 1 &&
                    typeof data.current === 'string' &&
                    Array.isArray(data.history) &&
                    typeof data.index === 'number'
                ) {
                    const restore = (s: string) => GameStateClass.empty().import(s)
                    const restoredCurrent = restore(data.current)
                    const restoredHistory = data.history.map((s: string) => restore(s))
                    setGameState(restoredCurrent)
                    setGameHistory(restoredHistory)
                    setCurrentHistoryIndex(data.index)
                    loaded = true
                }
            }
        } catch {
            // 不正データは無視して新規生成にフォールバック
        }
        if (!loaded) {
            startNewGame(initialParam)
        }
        setHydrated(true)
    }, [])

    // state 変化のたびに localStorage に保存。hydrate 完了前と空 state は除外。
    useEffect(() => {
        if (!hydrated) return
        if (gameState.bottles.length === 0) return
        try {
            const data = {
                v: 1,
                current: gameState.export(),
                history: gameHistory.map((g) => g.export()),
                index: currentHistoryIndex,
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        } catch {
            // 容量超過などは握り潰す
        }
    }, [gameState, gameHistory, currentHistoryIndex, hydrated])

    // 指定された状態にゲームをセットする関数（履歴はリセットする）
    const setGameStateAndResetHistory = (newGameState: GameStateClass) => {
      setGameHistory([newGameState])
      setGameState(newGameState)
      setCurrentHistoryIndex(0)
    }


  return {
    gameState,
    isGenerating,
    updateGameState,
    undoGameState,
    resetGameState,
    startNewGame,
    setGameStateAndResetHistory,
  }
}

export default useGameState

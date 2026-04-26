'use client'

import { useEffect, useState } from 'react'
import useGameState from '../hooks/useWsort'
import { GameState, Water, pour } from '../interfaces/wsort'
import { Move, isSolved, solve } from '../models/GameStateClass'
import styles from './board.module.css'

export const GameBoard = () => {
  const [colorNumber, setColorNumber] = useState<number>(3)
  const {
    gameState,
    isGenerating,
    updateGameState,
    undoGameState,
    resetGameState,
    startNewGame,
    setGameStateAndResetHistory,
  } = useGameState(colorNumber)
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null)
  const [solutionMoves, setSolutionMoves] = useState<Move[] | null>(null)

  // 復元された gameState の色数にスライダー表示を追従させる
  useEffect(() => {
    if (gameState.nColors > 0 && gameState.nColors !== colorNumber) {
      setColorNumber(gameState.nColors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.nColors])

  const handleBottleClick = (index: number) => {
    if (selectedBottle === null) {
      setSelectedBottle(index) // 最初のボトルを選択
    } else {
      // 色の移動ロジック
      const fromBottle = gameState.bottles[selectedBottle]
      const toBottle = gameState.bottles[index]
      if (selectedBottle !== index) {
        const [newFromBottle, newToBottle] = pour(fromBottle, toBottle)
        const newGameState = {
            ...gameState,
            bottles: gameState.bottles.map((bottle, i) =>
            i === selectedBottle
                ? newFromBottle
                : i === index
                ? newToBottle
                : bottle
            ),
            export: gameState.export,
            import: gameState.import,
        }
        updateGameState(newGameState)
        setSolutionMoves(null) // 手で動かしたら回答キャッシュは無効化

      }
      setSelectedBottle(null) // 選択状態をリセット
    }
  }

  const handleColorNumberChange = (newColorNumber: number) => {
    // ドラッグ中は表示値だけ更新し、再生成しない
    setColorNumber(newColorNumber)
  }
  const handleColorNumberCommit = () => {
    if (colorNumber !== gameState.nColors) {
      startNewGame(colorNumber)
      setSolutionMoves(null)
    }
  }
  const onImport = (gameStateString: string) => {
    setGameStateAndResetHistory(gameState.import(gameStateString))
    setColorNumber(gameState.nColors)
    setSolutionMoves(null)
  }

  const handleViewSolution = () => {
    const moves = solve(gameState.bottles)
    if (moves === null) {
      window.alert('今の状態からは解けません')
      return
    }
    if (moves.length === 0) {
      window.alert('既に解けています')
      return
    }
    setSolutionMoves(moves)
  }

  const handleNextStep = () => {
    if (!solutionMoves || solutionMoves.length === 0) return
    const m = solutionMoves[0]
    const [newFrom, newTo] = pour(gameState.bottles[m.from], gameState.bottles[m.to])
    const newGameState = {
      ...gameState,
      bottles: gameState.bottles.map((b, i) => (i === m.from ? newFrom : i === m.to ? newTo : b)),
      export: gameState.export,
      import: gameState.import,
    }
    updateGameState(newGameState)
    setSolutionMoves(solutionMoves.slice(1))
  }

  const cleared = gameState.bottles.length > 0 && isSolved(gameState.bottles)

  const handleUndo = () => {
    undoGameState()
    setSolutionMoves(null)
  }
  const handleReset = () => {
    if (!cleared && !window.confirm('現在の進行状況を初期状態に戻しますか？')) return
    resetGameState()
    setSolutionMoves(null)
  }
  const handleNewGame = () => {
    if (!cleared && !window.confirm('現在の盤面を破棄して新しいゲームを始めますか？')) return
    startNewGame(colorNumber)
    setSolutionMoves(null)
  }

  return (
    <div className="container">
      <h1>色水ソート</h1>
      <div className={styles.gameBoard}>
        {gameState.bottles.map((bottle, index) => (
          <div
            key={index}
            className={`${styles.bottle} ${selectedBottle === index ? styles.selected : ''} ${cleared ? styles.celebrate : ''}`}
            onClick={() => handleBottleClick(index)}
          >
            <BottleContentComponent
              waters={bottle.waters}
              maxCapacitySize={bottle.getMaxCapacitySize()}
            />
          </div>
        ))}
      </div>
      {cleared && <div className={styles.congratulations}>Congratulations!</div>}
      <div className={styles.toolbar}>
        <div className={`${styles.actionGroup} ${styles.primaryActions}`}>
          <button className={styles.btn} onClick={handleUndo} type="button">
            ↩ 1手戻る
          </button>
          {solutionMoves && solutionMoves.length > 0 && (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNextStep} type="button">
              ▶ 次の一手 ({solutionMoves.length})
            </button>
          )}
        </div>
        <div className={styles.actionGroup}>
          <button className={`${styles.btn} ${styles.btnWarn}`} onClick={handleReset} type="button">
            リセット
          </button>
          <button className={`${styles.btn} ${styles.btnWarn}`} onClick={handleNewGame} type="button">
            新しいゲーム
          </button>
          <button className={styles.btn} onClick={handleViewSolution} type="button">
            回答を見る
          </button>
        </div>
      </div>
      <ColorNumberSliderComponent
        colorNumber={colorNumber}
        onColorNumberChange={handleColorNumberChange}
        onColorNumberCommit={handleColorNumberCommit}
      />
      {isGenerating && <div className={styles.generating}>生成中…</div>}
      <div className={styles.actionGroup}>
        <ExportGameStateComponent gameState={gameState} />
        <ImportGameStateComponent onImport={onImport} />
      </div>
      <div className={styles.mobileBarSpacer} />
      <div className={styles.mobileBar}>
        <button className={styles.btn} onClick={handleUndo} type="button">
          ↩ 1手戻る
        </button>
        {solutionMoves && solutionMoves.length > 0 && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleNextStep} type="button">
            ▶ 次の一手 ({solutionMoves.length})
          </button>
        )}
      </div>
    </div>
  )
}

type BottleContentComponentProps = {
  waters: readonly Water[]
  maxCapacitySize: number
}

const BottleContentComponent: React.FC<BottleContentComponentProps> = (
  props
) => {
  const emptySpaces = props.maxCapacitySize - props.waters.length
  return (
    <>
      {/* bottleは水の描画をCSSでreverseしている */}
      {props.waters.map((water, index) => (
        <div
          key={index}
          className={`${styles.water} ${index === 0 ? styles.bottom : ''}`}
          style={{ backgroundColor: water.colorHexCode, color: water.getTextColor() }}
        >
          {water.label}
        </div>
      ))}
      {/* 空白部分を描画 */}
      {Array.from({ length: emptySpaces }, (_, index) => (
        <div key={`empty-${index}`} className={styles.emptySpace}></div>
      ))}
    </>
  )
}

type ColorNumberSliderComponentProps = {
  colorNumber: number
  onColorNumberChange: (colorNumber: number) => void
  onColorNumberCommit: () => void
}

const ColorNumberSliderComponent: React.FC<ColorNumberSliderComponentProps> = (
  props
) => {
  return (
    <div>
      <input
        className={styles.colorNumberSlider}
        title='色の数を変更する'
        type="range"
        min="2"
        max="20"
        value={props.colorNumber}
        onChange={(e) => props.onColorNumberChange(parseInt(e.target.value))}
        onMouseUp={() => props.onColorNumberCommit()}
        onTouchEnd={() => props.onColorNumberCommit()}
        onKeyUp={() => props.onColorNumberCommit()}
      />
      <span>{props.colorNumber}</span>
    </div>
  )
}

const ExportGameStateComponent: React.FC<{ gameState: GameState }> = (
  props
) => {
  const exportGameState = () => {
    return props.gameState.export()
  }
  return (
    <button className={`${styles.btn} ${styles.btnSubtle}`} onClick={() => window.prompt('この文字列をコピーしてどこかに保存してください', exportGameState())} type="button">
      保存
    </button>
  )
  }

const ImportGameStateComponent: React.FC<{ onImport: (gameStateString: string) => void }> = (
  props
) => {
  const importGameState = () => {
    const gameStateString = window.prompt('保存したセーブ文字を貼り付けてください')
    if (gameStateString) {
      props.onImport(gameStateString)
    }
  }
  return <button className={`${styles.btn} ${styles.btnSubtle}`} onClick={importGameState} type="button">復元</button>
}

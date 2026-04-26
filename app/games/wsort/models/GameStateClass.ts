import { Bottle, GameState, pour } from '../interfaces/wsort'
import { BottleClass } from './BottleClass'
import { WaterClass } from './WaterClass'

export class GameStateClass implements GameState {
  bottles: Bottle[]
  nColors: number

  constructor(bottles: Bottle[], nColors: number) {
    this.bottles = bottles
    this.nColors = nColors
  }

  static empty(): GameStateClass {
    return new GameStateClass([], 0)
  }

  // 「混色された満杯ボトル N本 + 空ボトル 2本」のレイアウトをランダム生成し、
  // BFS solver で解の存在を確認できたものを返す。不可能盤面は再試行で除外する。
  static random(nColors: number, maxAttempts = 50): GameStateClass {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const bottles = randomCanonicalLayout(nColors)
      if (isSolvable(bottles)) {
        return new GameStateClass(bottles, nColors)
      }
    }
    throw new Error(`Failed to generate a solvable wsort puzzle for nColors=${nColors}`)
  }

  export(): string {
    return JSON.stringify({
      bottles: this.bottles.map((bottle) => bottle.waters.map((water) => water.label)),
      nColors: this.nColors,
    })
  }

  import(gameStateString: string): GameStateClass {
    const gameState = JSON.parse(gameStateString)
    const bottles: Bottle[] = gameState.bottles.map((bottle: string[]) => {
      return new BottleClass(bottle.map((label) => WaterClass.fromLabel(label)))
    })
    return new GameStateClass(bottles, gameState.nColors)
  }
}

const randomCanonicalLayout = (nColors: number): Bottle[] => {
  const cap = BottleClass.maxCapacitySize
  const waters: WaterClass[] = []
  for (let i = 0; i < nColors; i++) {
    for (let j = 0; j < cap; j++) {
      waters.push(WaterClass.fromColorNumber(i))
    }
  }
  for (let i = waters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[waters[i], waters[j]] = [waters[j], waters[i]]
  }
  const bottles: Bottle[] = []
  for (let i = 0; i < nColors; i++) {
    bottles.push(new BottleClass(waters.slice(i * cap, (i + 1) * cap)))
  }
  bottles.push(BottleClass.getEmptyBottle())
  bottles.push(BottleClass.getEmptyBottle())
  return bottles
}

export const isSolved = (bottles: Bottle[]): boolean =>
  bottles.every(
    (b) =>
      b.isEmpty() ||
      (b.waters.length === b.getMaxCapacitySize() &&
        b.waters.every((w) => w.isSameColor(b.waters[0])))
  )

const stateKey = (bottles: Bottle[]): string =>
  bottles
    .map((b) => b.waters.map((w) => w.label).join(','))
    .sort()
    .join('|')

export type Move = { from: number; to: number }

// BFS で初期状態から解までの最短手順を求める。解なし or ノード上限到達時は null。
export const solve = (init: Bottle[], nodeLimit = 500000): Move[] | null => {
  const initKey = stateKey(init)
  if (isSolved(init)) return []
  const parents = new Map<string, { parentKey: string; move: Move }>()
  const seen = new Set<string>([initKey])
  type Item = { state: Bottle[]; key: string }
  const queue: Item[] = [{ state: init, key: initKey }]
  let nodes = 0
  let goalKey: string | null = null
  while (queue.length > 0 && nodes < nodeLimit) {
    const { state: cur, key: curKey } = queue.shift()!
    nodes++
    for (let i = 0; i < cur.length; i++) {
      if (cur[i].isEmpty()) continue
      for (let j = 0; j < cur.length; j++) {
        if (i === j) continue
        const [nf, nt] = pour(cur[i], cur[j])
        if (nf === cur[i]) continue
        const next = cur.map((b, k) => (k === i ? nf : k === j ? nt : b))
        const key = stateKey(next)
        if (seen.has(key)) continue
        seen.add(key)
        parents.set(key, { parentKey: curKey, move: { from: i, to: j } })
        if (isSolved(next)) {
          goalKey = key
          queue.length = 0
          break
        }
        queue.push({ state: next, key })
      }
      if (goalKey !== null) break
    }
  }
  if (goalKey === null) return null
  const moves: Move[] = []
  let k: string | null = goalKey
  while (k !== null) {
    const entry = parents.get(k)
    if (!entry) break
    moves.push(entry.move)
    k = entry.parentKey
  }
  return moves.reverse()
}

export const isSolvable = (init: Bottle[], nodeLimit = 500000): boolean =>
  solve(init, nodeLimit) !== null

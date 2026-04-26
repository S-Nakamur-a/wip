import { GameStateClass, isSolvable, isSolved } from './GameStateClass'
import { BottleClass } from './BottleClass'

describe('GameStateClass.random', () => {
  test('initial layout is N full bottles + 2 empty bottles', () => {
    const cap = BottleClass.maxCapacitySize
    for (const n of [2, 3, 5, 8]) {
      for (let trial = 0; trial < 5; trial++) {
        const gs = GameStateClass.random(n)
        expect(gs.nColors).toBe(n)
        expect(gs.bottles.length).toBe(n + 2)
        const fullCount = gs.bottles.filter((b) => b.waters.length === cap).length
        const emptyCount = gs.bottles.filter((b) => b.waters.length === 0).length
        expect(fullCount).toBe(n)
        expect(emptyCount).toBe(2)
      }
    }
  })

  test('initial layout contains exactly cap waters of each color', () => {
    const cap = BottleClass.maxCapacitySize
    for (const n of [2, 4, 6]) {
      const gs = GameStateClass.random(n)
      const counts = new Map<string, number>()
      for (const b of gs.bottles) {
        for (const w of b.waters) {
          counts.set(w.label, (counts.get(w.label) ?? 0) + 1)
        }
      }
      expect(counts.size).toBe(n)
      Array.from(counts.values()).forEach((c) => {
        expect(c).toBe(cap)
      })
    }
  })

  test('generated state is solvable and not already solved', () => {
    for (const n of [2, 3, 4, 5]) {
      const gs = GameStateClass.random(n)
      expect(isSolved(gs.bottles)).toBe(false)
      expect(isSolvable(gs.bottles)).toBe(true)
    }
  })
})

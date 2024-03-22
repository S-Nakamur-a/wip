export interface Bottle {
    waters: readonly Water[] // ビンに入っている色の水のリスト TODO: 最大4色なので、型を制限する。colors[0]が一番下の色、colors[3]が一番上の色（空かもしれない)
  
    isEmpty(): boolean
    isFull(): boolean
    hasCapacity(): boolean
    getCapacitySize(): number
    getMaxCapacitySize(): number
    getTopWater(): Water | null
    addWater(water: Water): Bottle
    removeTopWater(): Bottle
  }
  
  export interface Water {
    colorHexCode: string
    label: string
  
    isSameColor(other: Water): boolean
  }
  
  export interface GameState {
    bottles: Bottle[]
    nColors: number
  
    export(): string
    import(gameStateString: string): GameState
  }
  
  const movable = (fromBottle: Bottle, toBottle: Bottle): boolean => {
    if (fromBottle === toBottle) {
      return false
    }
    if (fromBottle.isEmpty() || toBottle.isFull()) {
      return false
    }
    if (
      toBottle.isEmpty() ||
      toBottle.getTopWater()?.isSameColor(fromBottle.getTopWater()!) === true
    ) {
      return true
    }
    return false
  }
  
  export const pour = (
    fromBottle: Bottle,
    toBottle: Bottle
  ): [Bottle, Bottle] => {
    while (movable(fromBottle, toBottle)) {
      toBottle = toBottle.addWater(fromBottle.getTopWater()!)
      fromBottle = fromBottle.removeTopWater()
    }
    return [fromBottle, toBottle]
  }
  
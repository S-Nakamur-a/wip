import { Bottle, Water } from '../interfaces/wsort'

export class BottleClass implements Bottle {
  waters: readonly Water[]
  static readonly maxCapacitySize: number = 4

  constructor(waters: Water[]) {
    this.waters = waters
  }

  isEmpty(): boolean {
    return this.waters.length === 0
  }

  isFull(): boolean {
    return this.waters.length === this.getMaxCapacitySize()
  }

  hasCapacity(): boolean {
    return this.waters.length < this.getMaxCapacitySize()
  }

  getCapacitySize(): number {
    return this.getMaxCapacitySize() - this.waters.length
  }

  getMaxCapacitySize(): number {
    return BottleClass.maxCapacitySize
  }

  static getEmptyBottle(): Bottle {
    return new BottleClass([])
  }

  getTopWater(): Water | null {
    if (this.isEmpty()) {
      return null
    }
    return this.waters[this.waters.length - 1]
  }
  removeTopWater(): BottleClass {
    if (this.isEmpty()) {
      return new BottleClass([])
    }
    // immutableな操作に変更
    const newWaters = this.waters.slice(0, this.waters.length - 1)
    return new BottleClass(newWaters)
  }

  addWater(water: Water): BottleClass {
    if (this.isEmpty() || this.getTopWater()?.isSameColor(water)) {
      return new BottleClass([...this.waters, water])
    }
    return new BottleClass(this.waters.slice())
  }
}

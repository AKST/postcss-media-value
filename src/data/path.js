// @flow

/*
 * A list of indexes from a child node to its parents
 */
export default class Path {
  _repr: Array<number>

  constructor (repr: Array<number>) {
    this._repr = repr
  }

  get length (): number {
    return this._repr.length
  }

  nthFromLeaf (index: number): number {
    return this._repr[index]
  }

  nthFromRoot (index: number): number {
    return this._repr[this._repr.length - (index + 1)]
  }
}


class Builder {
  _repr: Array<number>

  constructor () {
    this._repr = []
  }

  appendFromLeaf (index: number) {
    this._repr.push(index)
  }

  build () {
    return new Path(this._repr)
  }
}

export type PathBuilder = Builder

export function fromRootToLeaf (path: Array<number>): Path {
  return new Path(path.reverse())
}

export function makePathBuilder () {
  return new Builder()
}

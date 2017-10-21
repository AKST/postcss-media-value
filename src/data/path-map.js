// @flow

/*
 * A list of indexes from a child node to its parents
 */
export type Path = Array<number>

export default class PathMap<A> {
  _children: Map<number, ChildMap<A>>

  constructor () {
    this._children = new Map()
  }

  record (path: Path, nodeValue: A) {
    if (path.length < 1) throw new TypeError('path needs to have at least one index')
    const node = this._lookupNode(path, path.length - 1)
    node.setValue(nodeValue)
  }

  _lookupNode (path: Path, cursor: number): ChildMap<A> {
    const index = path[cursor]
    let child = this._children.get(index)

    // it's possible the path being made here is a new one
    if (child == null) {
      child = new ChildMap()
      this._children.set(index, child)
    }

    if (cursor - 1 === 0) return child
    return child._lookupNode(path, cursor - 1)
  }
}

class ChildMap<A> extends PathMap<A> {
  _value: ?A

  constructor () {
    super()
    this._value = null
  }

  setValue (value: ?A) {
    this._value = value
  }
}

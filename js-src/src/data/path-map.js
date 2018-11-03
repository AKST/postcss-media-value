// @flow

import type { PathBuilder } from '~/data/path'
import Path, { makePathBuilder } from '~/data/path'
import * as number from '~/util/number'


export default class PathMap<A> {
  _children: Map<number, ChildMap<A>>

  constructor () {
    this._children = new Map()
  }

  record (path: Path, nodeValue: A) {
    if (path.length < 1) throw new TypeError('path needs to have at least one index')
    const node = this._lookupNode(path, 0)
    node.setValue(nodeValue)
  }

  _lookupNode (path: Path, cursor: number): ChildMap<A> {
    const index = path.nthFromRoot(cursor)
    let child = this._children.get(index)

    // it's possible the path being made here is a new one
    if (child == null) {
      child = new ChildMap()
      this._children.set(index, child)
    }

    if (1 + cursor === path.length) return child
    return child._lookupNode(path, cursor + 1)
  }

  * descendingEntries (): Iterator<[Path, A]> {
    if (this._children.size < 1) return

    const keyArray = Array.from(this._children.keys())

    for (const key of keyArray.sort(number.descendCompare)) {
      const child: ChildMap<A> = (this._children.get(key): any)

      for (const { builder, value } of child.descendAsChild(key)) {
        builder.appendFromLeaf(key)
        yield [builder.build(), value]
      }
    }
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

  * descendAsChild (keyInParent: number): Iterator<{ builder: PathBuilder, value: A }> {
    if (this._value != null) {
      const value = this._value
      const builder = makePathBuilder()
      yield { builder, value }
    }

    if (this._children.size < 1) return

    const keyArray = Array.from(this._children.keys())

    for (const key of keyArray.sort(number.descendCompare)) {
      const child: ChildMap<A> = (this._children.get(key): any)
      for (const row of child.descendAsChild(key)) {
        row.builder.appendFromLeaf(key)
        yield row
      }
    }
  }
}

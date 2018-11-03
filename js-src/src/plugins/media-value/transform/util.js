// @flow
import Path, { makePathBuilder } from '~/data/path'

export function getPath (node: Object): Path {
  const builder = makePathBuilder()
  let child = node

  while (true) {
    const parent = child.parent
    if (parent == null) return builder.build()

    const index = parent.index(child)
    child = parent
    builder.appendFromLeaf(index)
  }

  // this just tells flow to stfu
  //
  // eslint-disable-next-line no-unreachable
  throw new TypeError('impossible')
}

export function lookup (path: Path, root: Object): Object {
  let node = root
  for (let index = path.length - 1; index >= 0; index -= 1) {
    node = node.nodes[path.nthFromLeaf(index)]
  }
  return node
}


// @flow
import type { Path } from '~/data/path-map'

export function getPath (node: Object): Path {
  const path = []
  let child = node

  while (true) {
    const parent = child.parent
    if (parent == null) return path

    const index = parent.index(child)
    child = parent
    path.push(index)
  }

  // this just tells flow to stfu
  //
  // eslint-disable-next-line no-unreachable
  throw new TypeError('impossible')
}

export function lookup (path: Path, root: Object): Object {
  let node = root
  for (let index = path.length - 1; index >= 0; index -= 1) {
    node = node.nodes[path[index]]
  }
  return node
}

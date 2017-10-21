import type { ResponsiveValue } from '~/parsing'
import type { Path } from '~/data/path-map'
import PathMap from '~/data/path-map'

export type NodeInfo = { value: ResponsiveValue }

export default class State {
  _nodes: PathMap<NodeInfo>

  constructor () {
    this._nodes = new PathMap()
  }

  record (path: Path, node: ResponsiveValue) {
    this._nodes.record(path, { value: node })
  }
}

export function create () {
  return new State()
}

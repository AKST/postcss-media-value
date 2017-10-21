import type { Path } from '~/data/path-map'
import PathMap from '~/data/path-map'

export type MediaValueMap = Map<any, string>
export type NodeInfo = { map: MediaValueMap }

export default class State {
  _nodes: PathMap<NodeInfo>

  constructor () {
    this._nodes = new PathMap()
  }

  record (path: Path, map: MediaValueMap) {
    this._nodes.record(path, { map })
  }
}

export function create () {
  return new State()
}

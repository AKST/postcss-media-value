// @flow

import Path from '~/data/path'
import PathMap from '~/data/path-map'

export type MediaValueMap = Map<any, string>
export type NodeInfo = {
  propName: string,
  mediaMap: MediaValueMap,
}

export default class State {
  _nodes: PathMap<NodeInfo>

  constructor () {
    this._nodes = new PathMap()
  }

  record (path: Path, nodeInfo: NodeInfo) {
    this._nodes.record(path, nodeInfo)
  }

  updatePaths (): Iterator<[Path, NodeInfo]> {
    return this._nodes.descendingEntries()
  }
}

export function create () {
  return new State()
}

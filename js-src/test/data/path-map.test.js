import { fromRootToLeaf } from '~/data/path'
import PathMap from '~/data/path-map'

test('descending keys iterator', () => {
  const map = new PathMap()
  map.record(fromRootToLeaf([0, 0]), 'a')
  map.record(fromRootToLeaf([0, 1]), 'b')
  map.record(fromRootToLeaf([1, 0]), 'c')
  map.record(fromRootToLeaf([2, 0, 1]), 'd')
  map.record(fromRootToLeaf([2, 1]), 'e')

  const ordered = Array.from(map.descendingEntries()).map(row => row[1])
  const expected = ['e', 'd', 'c', 'b', 'a']

  expect(ordered).toEqual(expected)
})

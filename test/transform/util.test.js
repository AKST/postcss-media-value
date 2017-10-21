import Path from '~/data/path'
import postcss from 'postcss'
import * as transform from '~/transform/util'

test('get path of a node', () => {
  const root = postcss.parse(`
    .rule { color: red; color: blue }
  `)

  const path = transform.getPath(root.nodes[0].nodes[1])
  expect(path).toEqual(new Path([1, 0]))
})

test('lookup a path of a node', () => {
  const root = postcss.parse(`
    .rule { color: red; color: blue }
  `)

  const node = root.nodes[0].nodes[1]
  const path = transform.getPath(node)
  expect(transform.lookup(path, root)).toEqual(node)
})

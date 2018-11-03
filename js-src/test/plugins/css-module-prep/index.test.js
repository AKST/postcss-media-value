import * as postcss from 'postcss'
import { withRoot } from '~/plugins/css-module-prep'

test('removes newlines', () => {
  const root = postcss.parse(`
    @value padding: media-value(
      else: "50px"
    );
  `)

  withRoot(root)
  expect(root.first.params).not.toEqual(expect.stringContaining('\n'))
})

test('is expected size', () => {
  const root = postcss.parse(`
    @value padding: media-value(
      else: "50px"
    );
  `)
  const expectedParams = 'padding: media-value( else: "50px" )'

  withRoot(root)
  expect(root.first.params).toEqual(expectedParams)
})

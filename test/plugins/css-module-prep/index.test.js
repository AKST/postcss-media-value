import * as postcss from 'postcss'
import { withRoot } from '~/plugins/css-module-prep'

test('just else clause', () => {
  const root = postcss.parse(`
    @value padding: media-value(
      else: "50px"
    );
  `)

  withRoot(root)
  expect(root.first.params).not.toEqual(expect.stringContaining('\n'))
})


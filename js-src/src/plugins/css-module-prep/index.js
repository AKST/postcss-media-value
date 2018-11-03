// @flow
import * as postcss from 'postcss'
import { isWhitespace } from '~/util/string'

export function withRoot (root: Object) {
  root.walkAtRules(rule => {
    if (rule.name !== 'value') return
    rule.params = minify(rule.params)
  })
}

/**
 * The purpose of this is to prep a project using css modules
 * to prepare the value at-rules before the css module value pass.
 */
export default postcss.plugin('postcss-responsive-value-css-module-prep', (options = {}) => {
  return root => withRoot(root)
})

function minify (input: string): string {
  type State = 'seek' | 'drop-space'

  // the plus one includes the colon index
  let colonIndex = input.indexOf(':') + 1
  let result = input.substr(0, colonIndex)
  let state: State = 'seek'

  for (let index = colonIndex; index < input.length; index += 1) {
    const char = input[index]

    outer: switch (state) {
      case 'drop-space':
        if (! isWhitespace(char)) {
          result += char
          state = 'seek'
        }
        break outer
      case 'seek':
        switch (char) {
          case ' ':
            result += char
            state = 'drop-space'
            break outer
          case '\n':
            break outer
          default:
            result += char
            break outer
        }
    }
  }

  return result
}

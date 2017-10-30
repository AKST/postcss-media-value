// @flow
import * as postcss from 'postcss'

export function withRoot (root: Object) {
  root.walkAtRules(rule => {
    console.log(rule.params)
  })
}

/**
 * The purpose of this is to prep a project using css modules
 * to prepare the value at-rules before the css module value pass.
 */
export default postcss.plugin('postcss-responsive-value-css-module-prep', (options = {}) => {
  return root => withRoot(root)
})

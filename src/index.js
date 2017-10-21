// @flow
import * as postcss from 'postcss'
import { createState, readDecl, applyUpdate } from '~/transform'

export default postcss.plugin('postcss-responsive-value', (options = {}) => {
  return root => {
    const state = createState()
    root.walkDecls(decl => readDecl(state, decl))
    applyUpdate(state, root)
  }
})

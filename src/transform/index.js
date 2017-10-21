// @flow
import type { Segment } from '~/parsing'
import type { MediaValueMap } from '~/transform/state'

import postcss from 'postcss'
import { enumerate } from '~/util/iterators'
import State, { create as createState } from '~/transform/state'
import * as util from '~/transform/util'
import { parseProperty } from '~/parsing'

const defaultKey = Symbol('default')

/**
 * Analysis a declaration and records any updates
 * that will need to occur.
 *
 * @param state - The state of the transformation.
 * @param decl - A declartion that's being analysised.
 */
export function readDecl (state: State, decl: Object) {
  // parse the property and get the AST of the properties value
  const result = parseProperty(decl.value)
  switch (result.type) {
    case 'normal': return
    case 'error': throw decl.error(result.reason)
    case 'responsive': {
      // expand the AST into the values that need to be represented
      // at the different media queries
      const reduceResult = expandProperty(result.segments, defaultKey)
      switch (reduceResult.type) {
        case 'error': throw decl.error(reduceResult.reason)
        case 'ok': {
          const path = util.getPath(decl)

          state.record(path, {
            propName: decl.prop,
            mediaMap: reduceResult.value,
          })
          break
        }
      }
      break
    }
  }
}

type ExpandResult
  = { type: 'ok', value: MediaValueMap }
  | { type: 'error', reason: string }

/**
 * This takes the sequence of repsonsive segments and turns it in
 * to map where keys are media queries, and the values are the
 * property values within those media queries.
 *
 * @param segments - The responsive segments.
 * @param defaultKey - The key used to define the default clause.
 */
export function expandProperty (segments: Array<Segment>, defaultKey: any): ExpandResult {
  type MediaState = { text: string, values: Map<number, ?string> }

  const initMediaState = () => ({ text: '', values: new Map() })
  const stateForQueries = new Map()

  // since we use this one often enough, we'll
  // keep a reference to it outside the map
  const defaultState: MediaState = initMediaState()
  stateForQueries.set(defaultKey, defaultState)

  let defaultWasSpecified = false

  // register every media query branch, we're
  // also using an old school for loop because
  // we also want the indexes
  for (const [i, segment] of enumerate(segments)) {
    if (segment.type !== 'value') continue
    const value = segment.value

    // set it regardless if it's there of not
    // because the null is meaningful later on
    defaultState.values.set(i, value.default)
    defaultWasSpecified = defaultWasSpecified || (!! value.default)

    // record each of the cases for the media query
    for (const branch of value.cases) {
      const stateMaybe = stateForQueries.get(branch.media)
      const state = stateMaybe || initMediaState()

      state.values.set(i, branch.value)
      if (stateMaybe == null) stateForQueries.set(branch.media, state)
    }
  }

  // if no default was specified then lets remove
  // it from the `stateForQueries` map
  if (! defaultWasSpecified) {
    stateForQueries.delete(defaultKey)
  }

  // now build out the value for each media query
  for (const [i, segment] of enumerate(segments)) {
    for (const [mediaQuery, state] of stateForQueries.entries()) {
      switch (segment.type) {
        case 'text': {
          state.text += segment.text
          break
        }
        case 'value': {
          let suffix = state.values.get(i)

          if (defaultWasSpecified && suffix == null) {
            suffix = defaultState.values.get(i)
          }

          // however if there are two media values in the
          // same property and they are non exhaustive
          // consider this an error. This happens when
          // one value is missing a query another has
          // without specifing a default
          if (suffix == null) {
            const reason = `non exhaustive media value for query "${mediaQuery}"`
            return { type: 'error', reason }
          }

          state.text += suffix
          break
        }
      }
    }
  }

  // now lets reduce it to the stuff we want, and drop
  // everything besides the text
  const resultMap = new Map()
  for (const [key, state] of stateForQueries.entries()) {
    resultMap.set(key, state.text)
  }

  return { type: 'ok', value: resultMap }
}

export function applyUpdate (state: State, root: Object, elseKey: any = defaultKey) {
  // type Instruction = {}
  // const instructions: Array<Instruction> = []

  for (const [path, info] of state.updatePaths()) {
    const decl = util.lookup(path, root)
    const ruleOriginal = decl.parent

    for (const [mediaQuery, value] of info.mediaMap) {
      if (mediaQuery === elseKey) {
        const clone = decl.cloneAfter()
        clone.value = value
      }
      else {
        const mediaAt = postcss.atRule({ name: 'media', params: mediaQuery })
        const mediaRule = postcss.rule({ selector: ruleOriginal.selector })
        mediaRule.append(postcss.decl({ prop: info.propName, value }))
        mediaAt.append(mediaRule)
        ruleOriginal.after(mediaAt)
      }
    }

    // no long needed
    decl.remove()
  }
}

export { createState }

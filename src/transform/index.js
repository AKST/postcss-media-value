// @flow
import type { Segment } from '~/parsing'
import type { MediaValueMap } from '~/transform/state'

import State, { create as createState } from '~/transform/state'
import * as util from '~/transform/util'
import { parseProperty } from '~/parsing'

const defaultKey = Symbol('default')

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
          state.record(path, reduceResult.value)
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

export function expandProperty (segments: Array<Segment>, defaultKey: any): ExpandResult {
  type MediaState = { text: string, mediaValue: Object }

  const initMediaState = () => ({ text: '', mediaValue: {} })
  const stateForQueries = new Map()

  stateForQueries.set(defaultKey, initMediaState())

  // register every media query branch
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i]

    if (segment.type !== 'value') continue
    const value = segment.value

    // ensure the default clause is registered
    if (value.default != null) {
      const state: MediaState = (stateForQueries.get(defaultKey): any)
      state.mediaValue[i] = value.default
    }

    // record each of the cases for the media query
    for (const branch of value.cases) {
      const stateMaybe = stateForQueries.get(branch.media)
      const state = stateMaybe || initMediaState()
      state.mediaValue[i] = branch.value
      if (stateMaybe == null) stateForQueries.set(branch.media, state)
    }
  }

  const defaultState: MediaState = (stateForQueries.get(defaultKey): any)

  // for each value create a values that'll be in each media query
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i]

    for (const [mediaQuery, state] of stateForQueries.entries()) {
      switch (segment.type) {
        case 'text': {
          state.text += segment.text
          break
        }
        case 'value': {
          let suffix = state.mediaValue[i]

          if (suffix == null) {
            suffix = defaultState.mediaValue[i]
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

  const resultMap = new Map()
  for (const [key, state] of stateForQueries.entries()) {
    resultMap.set(key, state.text)
  }

  return { type: 'ok', value: resultMap }
}

export { createState }

// @flow
import type { Segment } from '~/plugins/media-value/parsing'
import { parseProperty } from '~/plugins/media-value/parsing'

import type { MediaValueMap } from './state'
import State, { create as createState } from './state'
import * as util from './util'

import postcss from 'postcss'
import { enumerate } from '~/util/iterators'


const DEFAULT_KEY = Symbol('default')

/**
 * Analysis a declaration and records any updates
 * that will need to occur.
 *
 * @param state - The state of the transformation.
 * @param decl - A declartion that's being analysised.
 * @param defaultKey - Default key for the key for the
 * else clause.
 */
export function readDecl (state: State, decl: Object, defaultKey: any = DEFAULT_KEY) {
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

    // record each of the cases for the media query,
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

type TransformCache = Map<Object, {
  lastInsertedQuery: ?Object,
  queryLookup: Map<string, Object>,
}>

/**
 * Applies modifications to the abstract syntax tree needed to build out the
 * different media queries for the different values.
 *
 * @param state - The state of the transformation.
 * @param root - The root of the style AST.
 * @param elseKey - If the key was overloaded in a previous pass then you can
 * continue overloading in this function call.
 */
export function applyUpdate (state: State, root: Object, elseKey: any = DEFAULT_KEY) {
  // Keeps track of rules that were made for, the most imporatnt part of this
  // is respecting the order in which the media queries were declared as well
  // as grouping additionally responsive values in the same media query.
  const ruleCache: TransformCache = new Map()

  for (const [path, info] of state.updatePaths()) {
    const decl = util.lookup(path, root)
    const rule = decl.parent

    for (const [mediaQuery, value] of info.mediaMap) {
      if (mediaQuery === elseKey) {
        const clone = decl.cloneAfter()
        clone.value = value
      }
      else {
        const mediaRule = lookupMediaRule(rule, mediaQuery, ruleCache)
        mediaRule.prepend(postcss.decl({ prop: info.propName, value }))
      }
    }

    // no long needed
    decl.remove()
  }
}


function lookupMediaRule (
  rule: Object,
  mediaQuery: string,
  map: TransformCache,
): Object {
  let queryInfo = map.get(rule)
  if (queryInfo == null) {
    queryInfo = {
      lastInsertedQuery: null,
      queryLookup: new Map()
    }
    map.set(rule, queryInfo)
  }

  let mediaRule = queryInfo.queryLookup.get(mediaQuery)
  if (mediaRule == null) {
    mediaRule = postcss.rule({ selector: rule.selector })

    const query = postcss.atRule({
      name: 'media',
      params: mediaQuery,
      nodes: [mediaRule],
    })

    // # Why is there this logic for ordering of media query?
    //
    // Well, the map insert order is the same as the map
    // iteration order which is pretty annoying. So that
    // means the order in which the keys are defined will
    // be the order in which they'll be inserted, if it
    // was just appending to the end of the rule, that
    // means the order of the media queries will be the
    // reverse of how they were declared which isn't what
    // we want. So we keep track of the last inserted media
    // query for this rule.
    const insertOnto = queryInfo.lastInsertedQuery != null
      ? queryInfo.lastInsertedQuery
      : rule

    insertOnto.after(query)

    // update this so the next media query for this rule
    // will be added after this rule.
    queryInfo.lastInsertedQuery = query
    queryInfo.queryLookup.set(mediaQuery, mediaRule)
  }

  return mediaRule
}

export { createState }

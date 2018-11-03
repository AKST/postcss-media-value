// @flow
import State, { create as createState } from './state'
import * as util from './util'

const MEDIA_VALUE_FN_NAME = 'media-value'
const CASE_KEYWORD = 'case'
const ELSE_KEYWORD = 'else'
const AS_KEYWORD = 'as'

type ParseError = { type: 'error', reason: string }

// used when parsing, before validation
type ResponsiveValueArg
  = { type: 'case', media: string, value: string }
  | { type: 'else', value: string }

export type ResponsiveValueCase = { media: string, value: string }

export type ResponsiveValue = {
  cases: Array<ResponsiveValueCase>,
  default: ?string,
}

export type Segment
  = { type: 'text', text: string }
  | { type: 'value', value: ResponsiveValue }

export type ResponsiveTemplate
  = { type: 'responsive', segments: Array<Segment> }
  | { type: 'normal' }
  | ParseError

export function parseProperty (input: string): ResponsiveTemplate {
  const state = createState({ input, cursor: 0 })
  const segments: Array<Segment> = []

  while (state.hasMore()) {
    const start = seekMediaValue(state)
    if (start.type !== 'match') break

    // skip whitespace after function name
    util.skipWhitespace(state)

    const argsResult = parseResponsiveValue(state)
    if (argsResult.type === 'error') return argsResult
    if (argsResult.type !== 'match') continue


    const valueTransform = argsToValue(argsResult.args)
    if (valueTransform.type === 'error') return valueTransform
    if (valueTransform.type !== 'ok') continue

    // ignore any prefix information that is empty
    if (start.prefix !== '') {
      segments.push({ type: 'text', text: start.prefix })
    }

    segments.push({ type: 'value', value: valueTransform.value })
  }

  if (segments.length > 0) {
    // if the remaining content isn't empty then lets
    // add it as a text segment
    if (state.remaining !== '') {
      segments.push({ type: 'text', text: state.remaining })
    }
    return { type: 'responsive', segments }
  }

  // since we didn't find any segments lets just return
  // normal as the value for this
  return { type: 'normal' }
}


type MediaValueStart
  = { type: 'match', prefix: string }
  | { type: 'none' }

function seekMediaValue (state: State): MediaValueStart {
  const initialCursor = state.cursor

  if (util.seekSubString(state, MEDIA_VALUE_FN_NAME)) {
    const prefixLength = state.cursor - initialCursor
    const start = state.input.substr(initialCursor, prefixLength)
    state.increment(MEDIA_VALUE_FN_NAME.length)
    return { type: 'match', prefix: start }
  }

  state.unsafeSetCursor(initialCursor)
  return { type: 'none' }
}


type ResValueParseResult
   = { type: 'match', args: Array<ResponsiveValueArg> }
   | { type: 'none' }
   | ParseError

/**
 * Parses a responsive value.
 *
 * @param state - The current state of the parser.
 */
function parseResponsiveValue (state: State): ResValueParseResult {
  const toFailure = reason => ({ type: 'error', reason })
  if (! util.skipNextIf(state, '(')) return { type: 'none' }

  const args = []

  do {
    // check for closing paren
    util.skipWhitespace(state)
    if (state.head === ')') break

    // case branches
    else if (util.skipNextIf(state, CASE_KEYWORD)) {
      util.skipWhitespace(state)
      if (! util.skipNextIf(state, ':')) return toFailure('expected colon')

      util.skipWhitespace(state)
      const queryMatch = util.matchString(state)
      if (queryMatch.type !== 'match') return toFailure('expected media query string')

      util.skipWhitespace(state)
      if (! util.skipNextIf(state, AS_KEYWORD)) return toFailure('expected as keyword')

      util.skipWhitespace(state)
      if (! util.skipNextIf(state, ':')) return toFailure('expected colon')

      util.skipWhitespace(state)
      const valueMatch = util.matchString(state)
      if (valueMatch.type !== 'match') return toFailure('expected value string')

      const media = queryMatch.value
      const value = valueMatch.value
      args.push({ type: 'case', media, value })
      util.skipWhitespace(state)
    }
    // else branch
    else if (util.skipNextIf(state, ELSE_KEYWORD)) {
      util.skipWhitespace(state)
      if (! util.skipNextIf(state, ':')) return toFailure('expected colon')

      util.skipWhitespace(state)
      const valueMatch = util.matchString(state)
      if (valueMatch.type !== 'match') return toFailure('expected value string')

      const value = valueMatch.value
      args.push({ type: 'else', value })
      util.skipWhitespace(state)
    }
    // failure branch
    else {
      return toFailure('expected closing paran, case keyword, or else keyword')
    }
  } while (util.skipNextIf(state, ','))

  util.skipWhitespace(state)
  if (util.skipNextIf(state, ')')) return { type: 'match', args }
  return toFailure('expected closing paren')
}

type ArgTransform = { type: 'ok', value: ResponsiveValue } | ParseError

/**
 * @param args - The arguments being passed to the media-value function.
 */
function argsToValue (args: Array<ResponsiveValueArg>): ArgTransform {
  const cases = []
  let elseValue = null

  for (let i = 0; i < args.length; i += 1) {
    const argument = args[i]
    switch (argument.type) {
      case 'case': {
        const { media, value } = argument
        cases.push({ media, value })
        break
      }
      case 'else': {
        if (elseValue != null) return { type: 'error', reason: 'multiple else clauses' }
        elseValue = argument.value
        break
      }
      default:
        throw new TypeError('implementation error')
    }
  }

  return { type: 'ok', value: { cases, default: elseValue } }
}

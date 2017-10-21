// @flow
import State from './state'

const WHITESPACE_CHARS = [' ', '\n', '\t']


/**
 * @param state - The state of the parser.
 * @param string - The string being searched for.
 */
export function seekSubString (state: State, string: string): boolean {
  // TODO replace with more effient string search algo
  mainLoop: while (state.hasMore()) {
    for (let i = 0; i < string.length; i += 1) {
      const iSeek = string[i]
      const iInput = state.nthFromCursor(i)
      if (iSeek !== iInput) {
        state.increment()
        continue mainLoop
      }
    }
    return true
  }

  return false
}


type StringMatch
  = { type: 'match', value: string }
  | { type: 'none' }

/**
 * Parses strings, but returns the inside contents of
 * it without the quotes.
 *
 * @param state - Current parse state.
 */
export function matchString (state: State): StringMatch {
  const head = state.head
  const start = state.cursor

  if (head !== "'" && head !== '"') return { type: 'none' }

  while (true) {
    state.increment()
    const current = state.head

    if (current === head) {
      if (state.lookBack(1) !== '\\') break
    }
  }

  state.increment()
  const contents = state.input.slice(start + 1, state.cursor - 1)
  return { type: 'match', value: contents }
}

/**
 * Skips whitespace.
 *
 * @param state - The parsers state.
 */
export function skipWhitespace (state: State) {
  while (WHITESPACE_CHARS.includes(state.head)) state.increment()
}

/**
 * Skips next if it matches, and returns boolean to indicate
 * if the next set of characters were matches.
 *
 * @param state - The parsers state.
 * @param value - The value being skipped if matched.
 */
export function skipNextIf (state: State, value: string): boolean {
  const slice = state.sliceFromCursor(value.length)
  if (slice !== value) return false
  state.increment(value.length)
  return true
}

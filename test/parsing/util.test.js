import { create as createState } from '~/parsing/state'
import * as parsing from '~/parsing/util'

test('skipNextIf on match', () => {
  const input = `yo123`
  const state = createState({ input, cursor: 0 })

  expect(parsing.skipNextIf(state, 'yo')).toBeTruthy()
  expect(state.cursor).toEqual(2)
  expect(state.remaining).toEqual('123')
})

test('skipNextIf without match', () => {
  const input = `yo123`
  const state = createState({ input, cursor: 0 })

  expect(parsing.skipNextIf(state, '123')).toBeFalsy()
  expect(state.cursor).toEqual(0)
  expect(state.remaining).toEqual('yo123')
})

test('handle skipWhitespace ', () => {
  const input = `  123`
  const state = createState({ input, cursor: 0 })

  parsing.skipWhitespace(state)

  expect(state.cursor).toEqual(2)
  expect(state.remaining).toEqual('123')
})

test('seeking sub strings', () => {
  const input = `abcabacaba`
  //             --^  -^  -
  //               2   6
  const state = createState({ input, cursor: 0 })
  const substr = 'cab'

  expect(parsing.seekSubString(state, substr)).toBeTruthy()
  expect(state.cursor).toEqual(2)

  state.increment(substr.length)

  expect(parsing.seekSubString(state, substr)).toBeTruthy()
  expect(state.cursor).toEqual(6)
})

test('parsing a string', () => {
  const input = `"helloworld"`
  const state = createState({ input, cursor: 0 })

  const match = parsing.matchString(state)
  expect(match).toEqual({ type: 'match', value: 'helloworld' })
  expect(state.cursor).toEqual(input.length)
})

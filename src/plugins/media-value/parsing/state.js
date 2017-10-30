// @flow

export default class State {
  _cursor: number
  _input: string

  constructor (input: string, cursor: number) {
    this._cursor = cursor
    this._input = input
  }

  hasMore (): boolean {
    return this._input.length > this._cursor
  }

  lookBack (depth: number): string {
    return this._input[this._cursor - depth]
  }

  nthFromCursor (nth: number): string {
    return this._input[this._cursor + nth]
  }

  sliceFromCursor (amount: number): string {
    return this._input.substr(this._cursor, amount)
  }

  increment (amount: number = 1) {
    this._cursor += amount
  }

  /**
   * This should be really used as a last resort if there
   * is no other way to get a cursor to a certain state that
   * is required.
   *
   * @param value - Value to set cursor to.
   */
  unsafeSetCursor (value: number) {
    this._cursor = value
  }

  get head (): string {
    return this._input[this._cursor]
  }

  get remaining (): string {
    return this._input.substr(this._cursor)
  }

  get cursor (): number {
    return this._cursor
  }

  get input (): string {
    return this._input
  }
}


type StateInitDescriptor = { input: string, cursor: number }

export function create ({ input, cursor }: StateInitDescriptor) {
  return new State(input, cursor)
}

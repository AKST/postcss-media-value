// @flow

export type Error = { type: 'error', reason: string }
export type CanError<A> = A | Error

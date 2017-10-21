// @flow

export function* enumerate <T> (iterable: Iterable<T>): Iterator<[number, T]> {
  let i = 0

  for (const item of iterable) {
    yield [i, item]
    i += 1
  }
}

import * as core from '~/core/postcss_media_value_core'

/*
 * These are mostly sanity tests to see if
 * this, library behaves as expected.
 */
test('parseProperty + didParseProperty, with non media string', () => {
  const inputs = [
    'abc 123',
    'media-value hello',
  ]

  for (const input of inputs) {
    const result = core.parseProperty(input)
    expect(core.didParseProperty(result)).toEqual(true)
    result.free()
  }
})

/*
 * These are mostly sanity tests to see if
 * this, library behaves as expected.
 */
test('parseProperty + didParseProperty, with media string', () => {
  const inputs = [
    'media-value(case: "a" as: ":)")',
  ]

  for (const input of inputs) {
    const result = core.parseProperty(input)
    expect(core.didParseProperty(result)).toEqual(true)
    result.free()
  }
})

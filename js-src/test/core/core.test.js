import * as core from '~/core/postcss_media_value_core'

/*
 * These are mostly sanity tests to see if the interface between
 * us and the library is reasonable.
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

test('parseProperty + didParseProperty, with media string', () => {
  const inputs = [
    'media-value(case: "a" as: ":)")',
  ]

  for (const input of inputs) {
    const result = core.parseProperty(input)
    const success = core.didParseProperty(result)

    // for debugging purposes.
    ! success && core.logParsePropertyFailure(result)
    expect(success).toEqual(true)
    result.free()
  }
})

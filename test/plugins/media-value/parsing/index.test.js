import * as parsing from '~/plugins/media-value/parsing'


/*
 * Testing properties that shouldn't be handled
 */
test('normal properteries', () => {
  const inputs = [
    'abc 123',
    'media-value hello',
    '',
  ]

  for (const input of inputs) {
    const result = parsing.parseProperty(input)
    expect(result).toEqual({ type: 'normal' })
  }
})

test('media with single case', () => {
  const input = 'media-value(case: "a" as: ":)")'
  const result = parsing.parseProperty(input)

  expect(result).toEqual({
    type: 'responsive',
    segments: [{
      type: 'value',
      value: {
        cases: [{ media: 'a', value: ':)' }],
        default: null,
      },
    }],
  })
})

test('media with a few cases', () => {
  const input = `media-value(
    case: "a" as: "15px",
    case: "b" as: "35px",
    case: "c" as: "50px",
  )`
  const result = parsing.parseProperty(input)

  expect(result).toEqual({
    type: 'responsive',
    segments: [{
      type: 'value',
      value: {
        cases: [
          { media: 'a', value: '15px' },
          { media: 'b', value: '35px' },
          { media: 'c', value: '50px' },
        ],
        default: null,
      },
    }],
  })
})

test('media with default', () => {
  const input = `media-value(
    case: "a" as: "15px",
    else: "69px",
  )`
  const result = parsing.parseProperty(input)

  expect(result).toEqual({
    type: 'responsive',
    segments: [{
      type: 'value',
      value: {
        cases: [
          { media: 'a', value: '15px' },
        ],
        default: '69px',
      },
    }],
  })
})

test('media with only a default', () => {
  const input = 'solid black media-value(else: "15px")'
  const result = parsing.parseProperty(input)

  expect(result).toEqual({
    type: 'responsive',
    segments: [{
      type: 'text',
      text: 'solid black '
    }, {
      type: 'value',
      value: {
        cases: [],
        default: '15px',
      },
    }],
  })
})

test('media with no values', () => {
  const input = 'media-value()'
  const result = parsing.parseProperty(input)

  expect(result).toEqual({
    type: 'responsive',
    segments: [{
      type: 'value',
      value: {
        cases: [],
        default: null,
      },
    }],
  })
})

test('multiple media values in property', () => {
  const input = [
    `media-value(
      case: "a" as: "14px",
      case: "b" as: "10px",
      else: "15px",
    )`,
    ' ',
    `media-value(
      case: "a" as: "14px",
      else: "15px",
    )`,
    ' 15px',
  ].join('')
  const result = parsing.parseProperty(input)

  expect(result).toEqual({
    type: 'responsive',
    segments: [{
      type: 'value',
      value: {
        cases: [
          { media: 'a', value: '14px' },
          { media: 'b', value: '10px' },
        ],
        default: '15px',
      },
    }, {
      type: 'text',
      text: ' ',
    }, {
      type: 'value',
      value: {
        cases: [{ media: 'a', value: '14px' }],
        default: '15px',
      },
    }, {
      type: 'text',
      text: ' 15px',
    }],
  })
})

test('pick up prefix text', () => {
  const input = 'solid black media-value(case: "a" as: "15px")'
  const result = parsing.parseProperty(input)

  expect(result).toEqual({
    type: 'responsive',
    segments: [{
      type: 'text',
      text: 'solid black '
    }, {
      type: 'value',
      value: {
        cases: [{ media: 'a', value: '15px' }],
        default: null,
      },
    }],
  })
})

test('pick up postfix text', () => {
  const input = 'media-value(case: "a" as: "solid") black 15px'
  const result = parsing.parseProperty(input)

  expect(result).toEqual({
    type: 'responsive',
    segments: [{
      type: 'value',
      value: {
        cases: [{ media: 'a', value: 'solid' }],
        default: null,
      },
    }, {
      type: 'text',
      text: ' black 15px',
    }],
  })
})

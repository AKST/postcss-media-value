import * as transform from '~/plugins/media-value/transform'

test('with single branch, with default', () => {
  const segments = [{
    type: 'text',
    text: 'solid ',
  }, {
    type: 'value',
    value: {
      cases: [{ media: 'a', value: '15px' }],
      default: '10px',
    }
  }]

  const result = transform.expandProperty(segments, '_')
  expect(result).toEqual({
    type: 'ok',
    value: new Map([
      ['_', 'solid 10px'],
      ['a', 'solid 15px'],
    ]),
  })
})

test('with single branch, without default', () => {
  const segments = [{
    type: 'text',
    text: 'solid ',
  }, {
    type: 'value',
    value: {
      cases: [{ media: 'a', value: '15px' }],
      default: null,
    },
  }]

  const result = transform.expandProperty(segments, '_')
  expect(result).toEqual({
    type: 'ok',
    value: new Map([
      ['a', 'solid 15px'],
    ]),
  })
})

test('many branch, with single values', () => {
  const segments = [{
    type: 'text',
    text: 'solid ',
  }, {
    type: 'value',
    value: {
      cases: [
        { media: 'a', value: '15px' },
        { media: 'b', value: '20px' },
      ],
      default: null,
    },
  }]

  const result = transform.expandProperty(segments, '_')
  expect(result).toEqual({
    type: 'ok',
    value: new Map([
      ['a', 'solid 15px'],
      ['b', 'solid 20px'],
    ]),
  })
})

test('single branch, with many values, with out needing defaults', () => {
  const segments = [{
    type: 'text',
    text: 'solid ',
  }, {
    type: 'value',
    value: {
      cases: [{ media: 'a', value: '15px' }],
      default: null,
    },
  }, {
    type: 'text',
    text: ' ',
  }, {
    type: 'value',
    value: {
      cases: [{ media: 'a', value: 'black' }],
      default: null,
    },
  }]

  const result = transform.expandProperty(segments, '_')
  expect(result).toEqual({
    type: 'ok',
    value: new Map([
      ['a', 'solid 15px black'],
    ]),
  })
})

test('many branch, with many values, with out needing defaults', () => {
  const segments = [{
    type: 'text',
    text: 'solid ',
  }, {
    type: 'value',
    value: {
      cases: [
        { media: 'a', value: '15px' },
        { media: 'b', value: '20px' },
      ],
      default: null,
    },
  }, {
    type: 'text',
    text: ' ',
  }, {
    type: 'value',
    value: {
      cases: [
        { media: 'a', value: 'black' },
        { media: 'b', value: 'white' },
      ],
      default: null,
    },
  }]

  const result = transform.expandProperty(segments, '_')
  expect(result).toEqual({
    type: 'ok',
    value: new Map([
      ['a', 'solid 15px black'],
      ['b', 'solid 20px white'],
    ]),
  })
})

test('many branch, with many values, needing defaults', () => {
  const segments = [{
    type: 'text',
    text: 'solid ',
  }, {
    type: 'value',
    value: {
      cases: [
        { media: 'a', value: '15px' },
      ],
      default: '20px',
    },
  }, {
    type: 'text',
    text: ' ',
  }, {
    type: 'value',
    value: {
      cases: [
        { media: 'b', value: 'white' },
      ],
      default: 'black',
    },
  }]

  const result = transform.expandProperty(segments, '_')
  expect(result).toEqual({
    type: 'ok',
    value: new Map([
      ['_', 'solid 20px black'],
      ['a', 'solid 15px black'],
      ['b', 'solid 20px white'],
    ]),
  })
})

test('many branch, with many values, missing defaults', () => {
  const segments = [{
    type: 'text',
    text: 'solid ',
  }, {
    type: 'value',
    value: {
      cases: [
        { media: 'a', value: '15px' },
      ],
      default: '20px',
    },
  }, {
    type: 'text',
    text: ' ',
  }, {
    type: 'value',
    value: {
      cases: [
        { media: 'b', value: 'white' },
      ],
      default: null,
    },
  }]

  const result = transform.expandProperty(segments, '_')
  expect(result.type).toEqual('error')
})

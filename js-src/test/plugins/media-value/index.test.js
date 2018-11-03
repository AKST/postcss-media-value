import * as postcss from 'postcss'
import { withRoot } from '~/plugins/media-value'

test('just else clause', () => {
  const root = postcss.parse(`
    .root {
      padding: media-value(else: "50px")
    }
  `)

  withRoot(root)
  expect(root.first.first.value).toEqual('50px')
})

test('just else clause as infix', () => {
  const root = postcss.parse(`
    .root {
      padding: 50px media-value(else: "50px") 50px
    }
  `)

  withRoot(root)
  expect(root.first.first.value).toEqual('50px 50px 50px')
})

test('no else clause as infix', () => {
  const root = postcss.parse(`
    .root {
      padding: media-value(case: "a" as: "50px")
    }
  `)

  withRoot(root)
  expect(root.first.nodes).toEqual([])
  expect(root.first.next().first.first.value).toEqual('50px')
})

test('branching', () => {
  const root = postcss.parse(`
    .root {
      padding: media-value(
        case: "a" as: "25px",
        else: "50px",
      )
    }
  `)

  withRoot(root)
  expect(root.first.first.value).toEqual('50px')
  expect(root.first.next().first.first.value).toEqual('25px')
})

test('branching as infix', () => {
  const root = postcss.parse(`
    .root {
      padding: 0 media-value(
        case: "a" as: "25px",
        else: "50px",
      ) 1em;
    }
  `)

  withRoot(root)
  expect(root.first.first.value).toEqual('0 50px 1em')
  expect(root.first.next().first.first.value).toEqual('0 25px 1em')
})

test('many values in property, shared medias', () => {
  const root = postcss.parse(`
    .root {
      padding: media-value(
          case: "a" as: "25px",
          case: "b" as: "50px",
        ) media-value(
          case: "a" as: "15px",
          case: "b" as: "30px",
        );
    }
  `)

  withRoot(root)
  expect(root.first.nodes).toEqual([])
  expect(root.first.next().first.first.value).toEqual('25px 15px')
  expect(root.first.next().next().first.first.value).toEqual('50px 30px')
})

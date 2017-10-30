# PostCSS Media Value

## About

This is a [postCSS][PostCSS] plugin that allows you to define a responsive
value. For reuse I recommend you use something like [CSS modules][CSSModules],
with [CSS Modules values][CSSModulesValues].

## Installation

```bash
yarn add @akst.io/postcss-media-value
```

Update your build

```js
/* "your build" */
const postcssMediaValue = require('@akst.io/postcss-media-value');

const plugins = [
  // this is optional, but possibly required
  // depending on your css modules implementation
  new postcssMediaValue.CSSModulePrep({}),

  new CSSModules({}),
  new postcssMediaValue.MediaValue({}),
];

```

## Features

- **Value based**
  - Designed for CSS Modules.
- **Declaritive**
  - Can be nested in an expresssion like, `solid $borderSize black`
  - Properties can be the value itself like `$borderSize`
  - Properties can include multiple values `$verticalPadding $horizontalPadding`
  - Optional fallback
- **Mimumimal output**
  - Only produces as much output as required
- **Correctness**
  - Error messages for non exhaustive media queries when two values
    are used to together
  - Trys to retain the original ordering as much as possible
    - There are currently some quirks that need to be addressed in some
      edge cases, see [this issue][issue/1] for more information.

[issue/1]: https://github.com/AKST/postcss-media-value/issues/1

## Usage

Say you defined your config in some file, and you're using css modules.

```css
/* app/styles/grid.css */
@value mobile: only screen and (max-width: 375px);
@value desktop: only screen and (min-width: 376px);

/* ignore the terrible breakpoints */
@value basePadding: media-value(
  case: "desktop" as: "20px",
  case: "mobile" as: "10px",
  else: "0",
);

@value lineHeight: media-value(
  case: "desktop" as: "20px",
  case: "mobile" as: "16px",
  else: "1em",
);

/* note that these media value arguements
 * allow for trailing commas ;) */
@value lineCount: media-value(
  case: "desktop" as: "4",
  else: "2"
);
```

And you want to import, so you do so and use it like this.

```css
@value grid: 'app/styles/grid';
@value basePadding, lineHeight, lineCount from grid;

.tile {
  padding: basePadding;
  height: calc(lineHeight * lineCount);
}
```

You end up with this.

```css
/* Note the 'else' caluse is the first rule as 'else'
 * kinda has fallback semantics. This way it has the
 * least priority. However if unspecified, the original
 * declartion will be removed. */
.tile { padding: 0; height: calc(1em * 2); }

/* Also note how the first rule in the value defintition
 * appears after the original rule. This way the is a sense
 * of predictable ordering. */
@media only screen and (min-width: 376px) {
  /* note how the two properties who shared the media query
   * didn't end up in a different rule */
  .tile { padding: 20px; height: calc(20px * 4); }
}

@media only screen and (max-width: 375px) {
  /* note that even though we never specfied a case
   * for this lineCount in this media query, it picked
   * a value, and that's because a default value was
   * specified for it. */
  .tile { padding: 10px; height: calc(16px * 2); }
}
```


### More examples

See the examples folders.

## Contributing

> TL;DR run `make ci` on code before submitting a pull request.

### Workflow

I'm down with anyone contributing, try creating an issue first if
you have a feature idea or find a bug, just so I can track somewhere.
The only really thing I expect of contributed changes is that they're
run against the type checker, linter, and tests. You can do that by
running

```
make ci
```

If you have [watchman][watchman] installed, just run this for repeated
tests in the background.

```
make watch
```

You'll also want to install [Flow][Flow].

### Tests

We use Jest for the tests, but all you really know is to run `make test`.

### Linting & Code Style

I prefer to let the linter define the rules, so just run `make lint`.

[Flow]: https://flow.org
[watchman]: https://facebook.github.io/watchman/
[PostCSS]: http://postcss.org
[CSSModules]: https://github.com/css-modules/css-modules
[CSSModulesValues]: https://github.com/css-modules/postcss-icss-values

# PostCSS Media Value

## About

This is a [postCSS][PostCSS] plugin that allows you to define a responsive
value. For reuse I recommend you use something like [CSS modules][CSSModules],
with [CSS Modules values][CSSModulesValues].

## Installation

```
yarn add @akst.io/postcss-media-value
```

## Features

- Media dependent values
- Values can be used as you would expect them to
  - Can be nested in an expresssion like, `solid $borderSize black`
  - Properties can be the value itself like `$borderSize`
  - Properties can include multiple values `$verticalPadding $horizontalPadding`
- Only produces as much output as required
- Trys to retain the original ordering as much as possible
  - There are currently some quirks that need to be addressed in some
    edge cases, see [this issue][issue/1] for more information.


[issue/1]: https://github.com/AKST/postcss-media-value/issues/1

## Usage

Say you defined your config in some file, and you're using css modules.

```css
/* app/styles/grid.css */

/* ignore the terrible breakpoints */
@value basePadding: media-value(
  case: "only screen and (min-width: 1501px)" as: "50px",
  case: "only screen and (min-width: 901px) and (max-width: 1500px)" as: "40px",
  case: "only screen and (min-width: 601px) and (max-width: 900px)" as: "30px",
  case: "only screen and (min-width: 376px) and (max-width: 600px)" as: "20px",
  case: "only screen and (max-width: 375px)" as: "10px",
  else: "0"
);
```

And you want to import, so you do so and use it like this.

```css
@value grid: 'app/styles/grid';
@value basePadding from grid;

.tile {
  padding: basePadding;
}
```

You end up with this.

```css
/* Note the 'else' caluse is the first rule as 'else'
 * kinda has fallback semantics. This way it has the
 * least priority. However if unspecified, the original
 * declartion will be removed.
 */
.tile { padding: 0 }

/* Also note how the first rule in the value defintition
 * appears after the original rule. This way the is a sense
 * of predictable ordering. */
@media only screen and (min-width: 1501px) {
  .tile { padding: 50px; }
}

@media only screen and (min-width: 901px) and (max-width: 1500px) {
  .tile { padding: 40px; }
}

@media only screen and (min-width: 601px) and (max-width: 900px) {
  .tile { padding: 30px; }
}

@media only screen and (min-width: 376px) and (max-width: 600px) {
  .tile { padding: 20px; }
}

@media only screen and (max-width: 375px) {
  .tile { padding: 10px; }
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
[CSSModules]: https://github.com/css-modules/css-moduless
[CSSModulesValues]: https://github.com/css-modules/postcss-icss-values

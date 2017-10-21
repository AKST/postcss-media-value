# PostCSS Media Value

## About

This is a [postCSS][PostCSS] plugin that allows you to define a responsive
value. For reuse I recommend you use something like css modules.

## Installation

```
yarn add @akst.io/postcss-media-value
```

## Usage

Say you defined your config in some file, and you're using css modules.

```css
/* app/styles/grid.css */

/* ignore the terrible breakpoints */
@value arbitaryValue: media-value(
  case: "only screen and (min-width: 1501px)" as: 50px,
  case: "only screen and (min-width: 901px) and (max-width: 1500px)" as: 40px,
  case: "only screen and (min-width: 601px) and (max-width: 900px)" as: 30px,
  case: "only screen and (min-width: 376px) and (max-width: 600px)" as: 20px,
  case: "only screen and (max-width: 375px)" as: 10px,
);
```

And you want to import, so you do so and use it like this.

```css
@value grid: 'app/styles/grid';
@value arbitaryValue from grid;

.tile {
  padding: arbitaryValue;
}
```

You end up with this.

```css
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


[Flow]: https://flow.org
[watchman]: https://facebook.github.io/watchman/
[PostCSS]: http://postcss.org

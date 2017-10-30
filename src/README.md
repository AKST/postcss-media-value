```
     __
    /  \        ________________
    |  |       /                \
    @  @       | It looks like  |
    || ||      | like you're    |
    || ||   <--| trying to read |
    |\_/|      | the source!    |
    \___/      \________________/


```

# About these files

Hi, before you start crawling these directories here's a few
pointers that might save you some time.

## Folder Structure

Here is the basic layout

- `src`: You are here
  - `src/data`: Data structures used through out the plugins
  - `src/plugins`: Where the different plugins are stored (yes there is more than one).
    - `src/plugins/media-value`: The core plugin functionality.
    - `src/plugins/css-module-prep`: An optional plugin to aid in striping whitespace from at values.
  - `src/util`: Utility functionality used through out the plugins

### `src/plugins`

Basically since there are multiple postcss plugins in this
code base (at the time of writting this is the main one as
well as the css module prep one).

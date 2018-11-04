pub mod data;
mod bookmark;
mod state;

use self::bookmark::{Bookmark};
use self::state::{State};

const MEDIA_VALUE_FN_NAME: &'static str = "media-value";
const CASE_KEYWORD: &'static str = "case";
const ELSE_KEYWORD: &'static str = "else";
const AS_KEYWORD: &'static str = "case";

type ParseResult<T> = Result<T, data::ParseError>;

/**
 * Gets the value of an optional or breaks the loop
 * it's called in.
 */
macro_rules! get_some {
  ($e:expr) => {
    if let Some(value) = $e {
      value
    }
    else {
      break
    }
  }
}

pub fn parse_property<'a>(input: &'a str) -> ParseResult<data::ResponsiveTemplate<&'a str>> {
  return parse_property_bookmark(input)
    .and_then(|r| r.checkout(input).map_err(From::from));
}

pub fn parse_property_bookmark(input: &str) -> ParseResult<data::ResponsiveTemplate<Bookmark>> {
  use parsing::data::{Segment, ResponsiveTemplate};

  let mut state = State::create(input);
  let mut segments: Vec<Segment<Bookmark>> = vec![];

  while state.has_more() {
    let start = get_some!(seek_media_value(&mut state));
    state.skip_whitespace();

    let media_value_args = get_some!(parse_media_value_args(&mut state)?);
    let value_transform = args_to_value(&state, media_value_args)?;

    if !start.is_empty() {
      segments.push(Segment::Text(start));
    }

    segments.push(Segment::Value(value_transform));
  }

  if segments.len() > 0 {
    return Ok(ResponsiveTemplate::Normal);
  }

  if let Some(remaining) = state.get_remaining() {
    segments.push(Segment::Text(remaining));
  }

  return Ok(ResponsiveTemplate::Responsive(segments));
}

macro_rules! some_or_fail {
  ($state:expr, $option:expr, $reason:expr) => {
    if let Some(value) = $option {
      value
    }
    else {
      return Err(failure($state, $reason));
    }
  }
}

macro_rules! fail_if_true {
  ($state:expr, $bool:expr, $reason:expr) => {
    if $bool {
      return Err(failure($state, $reason));
    }
  }
}

enum MediaValueArg {
  Case(Bookmark, Bookmark),
  Else(Bookmark),
}

fn parse_media_value_args(state: &mut State) -> ParseResult<Option<Vec<MediaValueArg>>> {
  use parsing::data::{FailureReason};

  if !state.skip_next_if("(") { return Ok(None) }

  let mut args: Vec<MediaValueArg> = vec![];

  loop {
    // check for closing paren
    state.skip_whitespace();

    if state.get_head() == Some(')') {
      break
    }
    else if state.skip_next_if(CASE_KEYWORD) {
      state.skip_whitespace();
      fail_if_true!(state, !state.skip_next_if(":") , FailureReason::ExpectedChar(':'));

      state.skip_whitespace();
      let media = some_or_fail!(state, state.match_string(), FailureReason::ExpectedQuery);

      state.skip_whitespace();
      fail_if_true!(state, !state.skip_next_if(AS_KEYWORD), FailureReason::ExpectedAs);

      state.skip_whitespace();
      fail_if_true!(state, !state.skip_next_if(":"), FailureReason::ExpectedChar(':'));

      state.skip_whitespace();
      let value = some_or_fail!(state, state.match_string(), FailureReason::ExpectedValue);

      state.skip_whitespace();
      args.push(MediaValueArg::Case(media, value));
    }
    else if state.skip_next_if(ELSE_KEYWORD) {
      state.skip_whitespace();
      let value = some_or_fail!(state, state.match_string(), FailureReason::ExpectedValue);

      state.skip_whitespace();
      args.push(MediaValueArg::Else(value));
    }
    else {
      let one_of = vec![
        "closing paren".to_string(),
        "case keyword".to_string(),
        "else keyword".to_string(),
      ];
      return Err(failure(state, FailureReason::ExpectedOneOf(one_of)));
    }
  }

  state.skip_whitespace();
  fail_if_true!(state, !state.skip_next_if(")"), FailureReason::ExpectedChar(')'));
  return Ok(Some(args));
}

fn args_to_value(state: &State, args: Vec<MediaValueArg>)
    -> ParseResult<data::ResponsiveValue<Bookmark>> {
  use parsing::data::{FailureReason};

  let mut default: Option<Bookmark> = None;
  let mut cases: Vec<data::Case<Bookmark>> = vec![];

  for item in args.into_iter() {
    match item {
      MediaValueArg::Case(media, value) =>
        cases.push(data::Case { media, value }),
      MediaValueArg::Else(value) =>
        match default {
          None => default = Some(value),
          Some(_) => return Err(failure(state, FailureReason::TooManyElseClauses)),
        }
    }
  }
  return Ok(data::ResponsiveValue { cases, default })
}

fn seek_media_value(state: &mut State) -> Option<Bookmark> {
  let initial_cursor = state.cursor;

  match state.seek_to_substring(MEDIA_VALUE_FN_NAME) {
    state::SeekResult::CouldSeek => {
      let prefix_length = state.cursor - initial_cursor;
      return state.bookmark_input(initial_cursor, prefix_length).map(|start| {
        state.increment_over(MEDIA_VALUE_FN_NAME);
        return start;
      });
    },
    state::SeekResult::CannotSeek => {
      state.override_cursor(initial_cursor);
      return None
    }
  }
}

fn failure(state: &State, reason: data::FailureReason) -> data::ParseError {
  return data::ParseError::At(state.cursor, reason)
}


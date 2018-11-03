pub mod data;
mod state;

use self::data::{
  FailureReason,
  ParseError,
  ResponsiveTemplate,
  ResponsiveValue,
};
use self::state::{State};

const MEDIA_VALUE_FN_NAME: &'static str = "media-value";
const CASE_KEYWORD: &'static str = "case";
const ELSE_KEYWORD: &'static str = "else";
const AS_KEYWORD: &'static str = "case";

enum ResponsiveValueArg<'a> {
  Case(&'a str, &'a str),
  Else(&'a str),
}

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

pub fn parse_property(input: &str) -> Result<ResponsiveTemplate, ParseError> {
  let mut state = State::create(input);
  let mut _segments: Vec<data::Segment> = vec![];

  while state.has_more() {
    let start = get_some!(seek_media_value(&mut state));
    state.skip_whitespace();

    //let _responsive_value = try!(parse_responsive_value(&mut state));
  }

  Err(failure(&state, FailureReason::NotImplemented))
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

// fn parse_responsive_value<'b, 'a: 'b>(state: &'b mut State<'a>)
//       -> Result<Option<Vec<ResponsiveValueArg<'b>>>, ParseError> {
fn parse_responsive_value<'a, 'b: 'a, 'c: 'a>(state: &'b mut State<'a>)
      -> Result<Option<Vec<ResponsiveValueArg<'c>>>, ParseError> {
  if !state.skip_next_if("(") { return Ok(None) }

  let mut args: Vec<ResponsiveValueArg<'c>> = vec![];

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
      fail_if_true!(state, !state.skip_next_if(":") , FailureReason::ExpectedChar(':'));

      state.skip_whitespace();
      let value = some_or_fail!(state, state.match_string(), FailureReason::ExpectedValue);

      state.skip_whitespace();
      args.push(ResponsiveValueArg::Case(media, value));
    }
    else if state.skip_next_if(ELSE_KEYWORD) {
      state.skip_whitespace();
      let value = some_or_fail!(state, state.match_string(), FailureReason::ExpectedValue);

      state.skip_whitespace();
      args.push(ResponsiveValueArg::Else(value));
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

fn seek_media_value<'b, 'a: 'b>(state: &mut State<'a>) -> Option<&'b str> {
  let initial_cursor = state.cursor;

  match state.seek_to_substring(MEDIA_VALUE_FN_NAME) {
    state::SeekResult::CouldSeek => {
      let prefix_length = state.cursor - initial_cursor;
      return state.slice_input(initial_cursor, prefix_length).map(|start| {
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

fn failure(state: &State, reason: FailureReason) -> ParseError {
  return ParseError::At(state.cursor, reason)
}


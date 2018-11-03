pub mod data;
mod state;

use self::data::{ParseError, ResponsiveTemplate};
use self::state::{State};

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

pub fn parseProperty(input: &str) -> Result<ResponsiveTemplate, ParseError> {
	let mut state = State::create(input);
	let mut _segments: Vec<data::Segment> = vec![];

	while state.has_more() {
		let _renameme = get_some!(seek_media_value(&mut state));
	}

	Err(ParseError::NotImplemented)
}

fn seek_media_value(_state: &mut State) -> Option<String> {
	None
}


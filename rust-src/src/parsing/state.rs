
pub struct State<'a> {
	cursor: usize,
	indices: Vec<(usize, char)>,

	/**
	 * The input source.
	 */
	input: &'a str,
}

impl<'a> State<'a> {
	pub fn create<'b>(input: &'b str) -> State<'b> {
		let indices = input.char_indices().collect();
		State { input, indices, cursor: 0 }
	}

	pub fn length(self: &Self) -> usize {
		return self.indices.len();
	}

	pub fn get_head(self: &Self) -> Option<char> {
		return self.indices.get(self.cursor).map(|(_, c)| *c);
	}

  fn get_remaining(self: &Self) -> Option<&'a str> {
		let (start, _) = self.indices[self.cursor];
		let end = self.input.len();
    return self.input.get(start..end)
  }

	pub fn has_more(self: &Self) -> bool {
		return self.cursor < self.indices.len()
	}

	pub fn look_back(self: &Self, depth: usize) -> Option<char> {
		if depth <= self.cursor {
			let (_, c) = self.indices[self.cursor - depth];
			return Some(c)
		}
		return None
	}

	pub fn nth_from_cursor(self: &Self, nth: usize) -> Option<char> {
		let offset = self.cursor + nth;
		if self.length() >= offset {
			let (_, c) = self.indices[offset];
			return Some(c);
		}
		return None
	}

	pub fn slice_from_cursor(self: &Self, length: usize) -> Option<&'a str> {
		let (start, _) = self.indices[self.cursor];
		let (end, _) = self.indices[self.cursor + length];
		return self.input.get(start..end);
	}

	pub fn increment(self: &mut Self) {
		self.cursor += 1;
	}

  /**
   * This should be really used as a last resort if there
   * is no other way to get a cursor to a certain state that
   * is required.
   *
   * @param value - Value to set cursor to.
   */
  pub fn override_cursor(self: &mut Self, value: usize) {
    self.cursor = value
  }
}

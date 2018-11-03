
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

	pub fn has_more(self: &Self) -> bool {
		self.cursor < self.indices.len()
	}
}

use super::bookmark::Bookmark;

pub struct State<'a> {
  pub input: &'a str,
  pub cursor: usize,
  indices: Vec<(usize, char)>,
}

pub enum SeekResult {
  CouldSeek,
  CannotSeek,
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

  pub fn get_remaining(self: &Self) -> Option<Bookmark> {
    return self.indices.get(self.cursor).map(|(start, _)| {
      let end = self.input.len();
      return Bookmark { start: *start, end };
    });
  }

  pub fn has_more(self: &Self) -> bool {
    return self.cursor < self.indices.len();
  }

  pub fn look_back(self: &Self, depth: usize) -> Option<char> {
    if depth <= self.cursor {
      let (_, c) = self.indices[self.cursor - depth];
      return Some(c);
    }
    return None;
  }

  pub fn nth_from_cursor(self: &Self, nth: usize) -> Option<char> {
    let offset = self.cursor + nth;
    if self.length() >= offset {
      let (_, c) = self.indices[offset];
      return Some(c);
    }
    return None;
  }

  pub fn bookmark_input(self: &Self, from: usize, to: usize) -> Option<Bookmark> {
    let (start, _) = self.indices[from];
    let (end, _) = self.indices[to];
    return Some(Bookmark { start, end });
  }

  pub fn increment(self: &mut Self) {
    self.cursor += 1;
  }

  pub fn increment_over(self: &mut Self, string: &str) {
    self.cursor += string.chars().count();
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

  pub fn skip_whitespace(self: &mut Self) {
    // unsafe { debug::log("skipping_whitespace"); }
    while let Some(head) = self.get_head() {
      if !head.is_whitespace() {
        break;
      }
      self.increment();
    }
  }

  pub fn skip_next_if(self: &mut Self, string: &str) -> bool {
    for (i, c) in string.char_indices() {
      match (self.nth_from_cursor(i), c) {
        (Some(a), b) if a == b => continue,
        (_, _) => return false,
      }
    }
    self.increment_over(string);
    return true;
  }

  pub fn seek_to_substring(self: &mut Self, seek_string: &str) -> SeekResult {
    while self.has_more() {
      for (i, c) in seek_string.char_indices() {
        match (self.nth_from_cursor(i), c) {
          (None, _) => return SeekResult::CannotSeek,
          (Some(a), b) if a == b => continue,
          (Some(_), _) => {
            self.increment();
            break;
          }
        }
      }
      return SeekResult::CouldSeek;
    }
    return SeekResult::CannotSeek;
  }

  pub fn match_string<'c, 'b: 'c>(self: &'b mut Self) -> Option<Bookmark> {
    let start = self.cursor;
    let quote_type = match self.get_head() {
      Some(a) if a == '"' => a,
      Some(a) if a == '\'' => a,
      _ => return None,
    };

    loop {
      self.increment();
      match self.get_head() {
        Some(c) if c == quote_type => match self.look_back(1) {
          Some(d) if d == '\\' => continue,
          Some(_) => break,
          None => return None,
        },
        Some(_) => continue,
        None => return None,
      }
    }

    self.increment();
    let slice_start = start + 1;
    let slice_end = self.cursor - 1;
    return Some(Bookmark { start: slice_start, end: slice_end });
  }
}

#[cfg(test)]
mod tests {
  use super::State;
  use parsing::bookmark::Bookmark;

  const STRING: &'static str = "sally sells seashells";

  #[test]
  fn getters_work() {
    let state = State { cursor: 6, ..State::create(&STRING) };
    // string: "sally sells seashells";
    // cursor   ------^

    // there is no unicode so it should be equal.
    assert!(state.length() == STRING.len());
    assert!(state.get_head() == Some('s'));
    assert!(state.has_more());

    let remaining = Bookmark::create(6, STRING.len());
    assert!(state.get_remaining() == Some(remaining));
  }

  #[test]
  fn look_back_works() {
    let state = State { cursor: 6, ..State::create(&STRING) };
    // string: "sally sells seashells";
    // cursor   ------^

    // string: "sally sells seashells"
    // look back    ^--
    assert!(state.look_back(2) == Some('y'));
  }

  #[test]
  fn nth_from_cursor_works() {
    let state = State { cursor: 6, ..State::create(&STRING) };
    // string: "sally sells seashells";
    // cursor   ------^

    // string: "sally sells seashells"
    // look ahad      -^
    assert!(state.nth_from_cursor(1) == Some('e'));

    // string: "sally sells seashells"
    // look ahad      ---------^
    assert!(state.nth_from_cursor(9) == Some('s'));

    // string: "sally sells seashells"
    // look ahad      ----------^
    assert!(state.nth_from_cursor(10) == Some('h'));
  }

  #[test]
  fn increment_works() {
    let mut state = State::create("abcd");
    state.increment();
    assert!(state.cursor == 1);
    assert!(state.get_head() == Some('b'));
  }

  #[test]
  fn skip_whitespace_works() {
    let mut state = State::create("   a");
    state.skip_whitespace();
    assert!(state.cursor == 3 as usize);
    assert!(state.get_head() == Some('a'));
  }

  #[test]
  fn skip_whitespace_works_with_just_whitespace() {
    let mut state = State::create("   ");
    state.skip_whitespace();
    assert!(state.cursor == 3);
    assert!(state.get_head() == None);
  }
}

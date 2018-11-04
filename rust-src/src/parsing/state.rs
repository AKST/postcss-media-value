use super::bookmark::{Bookmark};

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
      return Bookmark { start: *start, end }
    })
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
    loop {
      let (_, head) = self.indices[self.cursor];
      if head.is_whitespace() { break }

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
            break
          },
        }
      }
      return SeekResult::CouldSeek
    }
    return SeekResult::CannotSeek
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
        Some(c) if c == quote_type =>
          match self.look_back(1) {
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

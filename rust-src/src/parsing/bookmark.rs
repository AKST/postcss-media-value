pub struct Bookmark {
  pub start: usize,
  pub end: usize,
}


pub enum CheckoutError {
  At(Bookmark),
}

impl Bookmark {
  pub fn is_empty(self: &Self) -> bool {
    return self.start == self.end;
  }

  pub fn checkout<'a>(self: &Self, s: &'a str) -> Option<&'a str> {
    return s.get(self.start..self.end);
  }

  pub fn checkout_result<'a>(self: Self, s: &'a str) -> Result<&'a str, CheckoutError> {
    return self.checkout(s).map_or(
        Err(CheckoutError::At(self)),
        Ok,
    );
  }
}


pub fn option_checkout_result<T, F>(option: Option<Bookmark>, f: F)
    -> Result<Option<T>, CheckoutError>
    where F: Fn(&Bookmark) -> Option<T> {
  match option {
    None => Ok(None),
    Some(b) => match f(&b) {
      Some(v3) => Ok(Some(v3)),
      None => Err(CheckoutError::At(b)),
    },
  }
}

use super::bookmark::{
  Bookmark,
  CheckoutError,
  option_checkout_result,
};

#[wasm_bindgen]
pub enum ResponsiveTemplate<T> {
	Responsive(Vec<Segment<T>>),
	Normal,
}

pub enum ParseError {
  At(usize, FailureReason),
  FailedToCheckoutOut(Bookmark)
}

#[wasm_bindgen]
pub enum FailureReason {
  ExpectedChar(char),
  ExpectedQuery,
  ExpectedValue,
  ExpectedAs,
  ExpectedOneOf(Vec<String>),
	NotImplemented,
  TooManyElseClauses,
}

#[wasm_bindgen]
pub enum Segment<T> {
	Text(T),
	Value(ResponsiveValue<T>),
}

#[wasm_bindgen]
pub struct ResponsiveValue<T> {
	pub cases: Vec<Case<T>>,
	pub default: Option<T>,
}

#[wasm_bindgen]
pub struct Case<T> {
  pub media: T,
  pub value: T,
}

type CheckoutResult<T> = Result<T, CheckoutError>;

impl ResponsiveTemplate<Bookmark> {
  pub fn checkout<'a>(self: Self, input: &'a str) -> CheckoutResult<ResponsiveTemplate<&'a str>> {
    match self {
      ResponsiveTemplate::Normal => Ok(ResponsiveTemplate::Normal),
      ResponsiveTemplate::Responsive(s) => {
        let mapped = try!(s
            .into_iter()
            .map(|s| s.checkout(input))
            .collect());
        return Ok(ResponsiveTemplate::Responsive(mapped));
      }
    }
  }

  pub fn checkout_owned(self: Self, input: &str) -> CheckoutResult<ResponsiveTemplate<String>> {
    match self {
      ResponsiveTemplate::Normal => Ok(ResponsiveTemplate::Normal),
      ResponsiveTemplate::Responsive(s) => {
        let mapped = try!(s
            .into_iter()
            .map(|s| s.checkout_owned(input))
            .collect());
        return Ok(ResponsiveTemplate::Responsive(mapped));
      }
    }
  }
}

impl Segment<Bookmark> {
  pub fn checkout<'a>(self: Self, input: &'a str) -> CheckoutResult<Segment<&'a str>> {
    match self {
      Segment::Text(b) => b.checkout_result(input).map(Segment::Text),
      Segment::Value(rv) => rv.checkout(input).map(Segment::Value),
    }
  }

  pub fn checkout_owned(self: Self, input: &str) -> CheckoutResult<Segment<String>> {
    match self {
      Segment::Text(b) => b.checkout_result(input).map(|s| Segment::Text(s.to_string())),
      Segment::Value(rv) => rv.checkout_owned(input).map(Segment::Value),
    }
  }
}

impl ResponsiveValue<Bookmark> {
  pub fn checkout<'a>(self: Self, input: &'a str) -> CheckoutResult<ResponsiveValue<&'a str>> {
    let ResponsiveValue { cases, default } = self;
    let cases = try!(cases.into_iter().map(|c| c.checkout(input)).collect());
    let default = try!(option_checkout_result(default, |b| b.checkout(input)));
    return Ok(ResponsiveValue { cases, default })
  }

  pub fn checkout_owned(self: Self, input: &str) -> CheckoutResult<ResponsiveValue<String>> {
    let ResponsiveValue { cases, default } = self;
    let cases = try!(cases.into_iter().map(|c| c.checkout_owned(input)).collect());
    let default = try!(option_checkout_result(default, |b| b.checkout_owned(input)));
    return Ok(ResponsiveValue { cases, default })
  }
}

impl Case<Bookmark> {
  pub fn checkout<'a>(self: Self, input: &'a str) -> CheckoutResult<Case<&'a str>> {
    let Case { media, value } = self;
    let media = try!(media.checkout_result(input));
    let value = try!(value.checkout_result(input));
    return Ok(Case { media, value });
  }

  pub fn checkout_owned(self: Self, input: &str) -> CheckoutResult<Case<String>> {
    let Case { media, value } = self;
    let media = try!(media.checkout_result(input)).to_string();
    let value = try!(value.checkout_result(input)).to_string();
    return Ok(Case { media, value });
  }
}

impl ParseError {
  pub fn to_string(self: Self, input: &str) -> String {
    match self {
      ParseError::FailedToCheckoutOut(bookmark) => (
        format!("internal error with translating bookmarks, {}", bookmark)
      ),
      ParseError::At(at, reason) =>
        format!(
          "{} @ {} in {}",
          match reason {
            FailureReason::NotImplemented =>
              "undocumented error".to_string(),

            FailureReason::ExpectedChar(c) =>
              format!("expected {}", c.to_string()),

            FailureReason::ExpectedQuery =>
              "expected 'media query'".to_string(),

            FailureReason::ExpectedValue =>
              "expected 'value of query'".to_string(),

            FailureReason::ExpectedAs =>
              "expected 'as-keyword'".to_string(),

            FailureReason::ExpectedOneOf(v) =>
              format!("expected one of ({})", v.join(", ")),

            FailureReason::TooManyElseClauses =>
              "unexpected else keyword (you may have too many)".to_string(),
          },
          at,
          input,
        )
    }
  }
}

impl From<CheckoutError> for ParseError {
  fn from(error: CheckoutError) -> ParseError {
    match error {
      CheckoutError::At(bookmark) => ParseError::FailedToCheckoutOut(bookmark)
    }
  }
}

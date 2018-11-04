use super::bookmark::{
  Bookmark,
  CheckoutError,
  option_checkout_result,
};

pub enum ResponsiveTemplate<T> {
	Responsive(Vec<Segment<T>>),
	Normal,
}

pub enum ParseError {
  At(usize, FailureReason),
  FailedToCheckoutOut(CheckoutError)
}

pub enum FailureReason {
  ExpectedChar(char),
  ExpectedQuery,
  ExpectedValue,
  ExpectedAs,
  ExpectedOneOf(Vec<String>),
	NotImplemented,
  TooManyElseClauses,
}

pub enum Segment<T> {
	Text(T),
	Value(ResponsiveValue<T>),
}

pub struct ResponsiveValue<T> {
	pub cases: Vec<Case<T>>,
	pub default: Option<T>,
}

pub struct Case<T> {
  pub media: T,
  pub value: T,
}

type CheckoutResult<T> = Result<T, CheckoutError>;

impl ResponsiveTemplate<Bookmark> {
  pub fn checkout<'a>(self: Self, input: &'a str)
      -> Result<ResponsiveTemplate<&'a str>, CheckoutError> {
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
}

impl Segment<Bookmark> {
  pub fn checkout<'a>(self: Self, input: &'a str) -> CheckoutResult<Segment<&'a str>> {
    match self {
      Segment::Text(b) => b.checkout_result(input).map(Segment::Text),
      Segment::Value(rv) => rv.checkout(input).map(Segment::Value),
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
}

impl Case<Bookmark> {
  pub fn checkout<'a>(self: Self, input: &'a str) -> CheckoutResult<Case<&'a str>> {
    let Case { media, value } = self;
    let media = try!(media.checkout_result(input));
    let value = try!(value.checkout_result(input));
    return Ok(Case { media, value });
  }
}

impl From<CheckoutError> for ParseError {
  fn from(error: CheckoutError) -> ParseError {
    return ParseError::FailedToCheckoutOut(error);
  }
}

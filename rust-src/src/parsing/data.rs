#[wasm_bindgen]
pub enum ResponsiveTemplate {
	Responsive(Vec<Segment>),
	Normal,
}

pub enum ParseError {
  At(usize, FailureReason),
}

pub enum FailureReason {
  ExpectedChar(char),
  ExpectedQuery,
  ExpectedValue,
  ExpectedAs,
  ExpectedOneOf(Vec<String>),
	NotImplemented
}

#[wasm_bindgen]
pub enum Segment {
	Text(String),
	Value(ResponsiveValue),
}

#[wasm_bindgen]
pub struct ResponsiveValue {
	cases: Vec<ResponsiveValueCase>,
	default: Option<String>,
}

#[wasm_bindgen]
pub enum ResponsiveValueCase { Case(Case), Else(String) }

#[wasm_bindgen]
pub struct Case { media: String, value: String }

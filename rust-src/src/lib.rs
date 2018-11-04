#![feature(custom_attribute)]
#![feature(unrestricted_attribute_tokens)]

extern crate wasm_bindgen;
extern crate js_sys;

pub mod parsing;

use wasm_bindgen::prelude::*;
use parsing::data::{ResponsiveTemplate, ParseError};
use parsing::{parse_property_bookmark};

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen(js_namespace=console, js_name=log)]
  pub fn console_log(s: &str);
}

/**
 * So turns out we cannot expose method or expect the
 * user of these functions to be able to travser our
 * data types.
 */
#[wasm_bindgen]
pub struct ParseResult(Result<ResponsiveTemplate<String>, String>);

#[wasm_bindgen(js_name = didParseProperty)]
pub fn did_parse_property(result: &ParseResult) -> bool {
  match result {
    ParseResult(Err(_)) => false,
    ParseResult(Ok(_)) => true,
  }
}

#[wasm_bindgen(js_name = logParsePropertyFailure)]
pub fn log_parse_property_failure(result: &ParseResult) {
  if let ParseResult(Err(e)) = result {
    console_log(&format!("{}", e));
  }
}

#[wasm_bindgen(js_name = parseProperty)]
pub fn parse_property(input: &str) -> ParseResult {
  ParseResult(run_parse(input).map_err(|e| e.to_string(input)))
}

fn run_parse(input: &str) -> Result<ResponsiveTemplate<String>, ParseError> {
  let book_marked = parse_property_bookmark(input)?;
  let owned_ast = book_marked.checkout_owned(input)?;
  return Ok(owned_ast);
}

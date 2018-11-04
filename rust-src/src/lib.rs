#![feature(custom_attribute)]

extern crate wasm_bindgen;

pub mod parsing;

use wasm_bindgen::prelude::*;
use parsing::data::{ResponsiveTemplate, ParseError};
use parsing::{parse_property_bookmark};

#[wasm_bindgen]
pub struct ParseResult(Result<ResponsiveTemplate<String>, String>);

#[wasm_bindgen]
pub fn did_parse(result: &ParseResult) -> bool {
  match result {
    ParseResult(Err(_)) => false,
    ParseResult(Ok(_)) => true,
  }
}

#[wasm_bindgen]
pub fn log_failure(result: &ParseResult) {
  if let ParseResult(Err(e)) = result {
    println!("{}", e);
  }
}

#[wasm_bindgen]
pub fn parse(input: &str) -> ParseResult {
  ParseResult(run_parse(input).map_err(|e| e.to_string(input)))
}

fn run_parse(input: &str) -> Result<ResponsiveTemplate<String>, ParseError> {
  let book_marked = parse_property_bookmark(input)?;
  let owned_ast = book_marked.checkout_owned(input)?;
  return Ok(owned_ast);
}

#![feature(custom_attribute)]

extern crate wasm_bindgen;

pub mod parsing;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn hello() {
  println!("Hello, world!");
}

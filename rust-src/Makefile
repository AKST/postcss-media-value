DIST=../dist
EXTERN_DIR=../js-src/src/extern
NAME=parser

default: init
	cargo +nightly build --target wasm32-unknown-unknown
	wasm-bindgen target/wasm32-unknown-unknown/debug/$(NAME).wasm --out-dir $(EXTERN_DIR)

ci: init
	cargo test

init: flags/wasm32-unknown-unknown flags/wasm-bindgen-cli

clean:
	cargo clean

flags/wasm32-unknown-unknown: flags
	rustup target add wasm32-unknown-unknown --toolchain nightly
	touch flags/wasm32-unknown-unknown

flags/wasm-bindgen-cli: flags
	[ -f "$@" ] || cargo install wasm-bindgen-cli
	touch flags/wasm-bindgen-cli

flags:
	mkdir -p flags

.PHONY: default

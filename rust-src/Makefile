DIST=../dist
EXTERN_DIR=../js-src/src/extern
EXTERN_DIST=$(DIST)/src/extern
TARGET_DIR=target/wasm32-unknown-unknown/debug
NAME=parser

default: init $(EXTERN_DIR) $(EXTERN_DIST)
	cargo +nightly build --target wasm32-unknown-unknown
	@wasm-bindgen $(TARGET_DIR)/$(NAME).wasm --out-dir $(EXTERN_DIR)
	@wasm-bindgen $(TARGET_DIR)/$(NAME).wasm --out-dir $(EXTERN_DIST) --no-typescript
	@# disables linting on these files.
	@find "$(EXTERN_DIR)" -name "*.js" \
		| xargs -n 1 sed -i.old '1s;^;/* eslint-disable */;'

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

$(EXTERN_DIR):
	mkdir -p $(EXTERN_DIR)

$(EXTERN_DIST):
	mkdir -p $(EXTERN_DIST)

.PHONY: default clean init ci

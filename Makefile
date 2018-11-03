default: build

build: build-rust build-js

ci:
	@make -C rust-src ci
	@make -C js-src ci

clean:
	@make -C rust-src clean
	@make -C js-src clean

publish: clean build
	@make -C js-src publish

build-js:
	@make -C js-src

build-rust:
	@make -C rust-src

.PHONY: ci default build-rust build-js build clean publish

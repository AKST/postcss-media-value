default: js rust

js:
	@make -C js-src

rust:
	@make -C rust-src

.PHONY: default rust js

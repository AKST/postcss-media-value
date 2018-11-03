ROOT=$(shell pwd)/..
DOCS=../docs
DIST=../dist
SYSTEM=$(shell uname)

default: build

ci: type lint test

init:
	yarn install
	./node_modules/.bin/flow-typed install

node_modules:
	yarn install

flow-typed: node_modules
	./node_modules/.bin/flow-typed install

build: node_modules
	./node_modules/.bin/babel src --out-dir $(DIST)/src --source-maps inline
	./node_modules/.bin/babel test --out-dir $(DIST)/test --source-maps inline
	cp ./package.json $(DIST)/.

test: build node_modules
	cd $(DIST) && ../node_modules/.bin/jest

type: node_modules
	./node_modules/.bin/flow status

lint: node_modules
	./node_modules/.bin/eslint src test

docs: node_modules
	./node_modules/.bin/documentation build \
		src/** src/* -f html -o $(DOCS) \
		--document-exported \
		--infer-private \
		--name jo-script

watch:
	@which watchman-make > /dev/null || ( echo 'install watchman' && exit 1 )
	watchman-make -p 'src/**/*.js' 'src/*.js' 'test/**/*.js' 'test/*.js' -t ci

reset:
	rm -rf flow-typed
	rm -rf node_modules
	rm -rf $(DIST)
	rm -rf $(DOCS)
	make init

clean:
	rm -rf $(DIST)

publish-build:
	./node_modules/.bin/babel src --out-dir $(DIST)
	rm -rf $(DIST)/test $(DIST)/fixtures $(DIST)/examples
	cp package.json $(DIST)/.
	cp README.md $(DIST)/.
	cp CHANGELOG.md $(DIST)/.

publish: publish-build
	npm version patch
	cp package.json $(DIST)/.
	cd $(DIST) && npm publish
	cd $(ROOT)
	git push origin master --tags

.PHONY: default watch ci init build clean docs type lint test

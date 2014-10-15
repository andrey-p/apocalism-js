SHELL := /bin/bash

lint:
	./node_modules/.bin/jslint ./*.js
	./node_modules/.bin/jslint ./lib/*.js ./lib/**/*.js
	./node_modules/.bin/jslint --predef before \
		--predef beforeEach \
		--predef describe \
		--predef it \
		--predef after \
		--predef afterEach \
		./test/*.js \
		./test/**/*.js

test:
	@./node_modules/.bin/mocha -R spec -t 10000 \
	test/*.js \
	test/**/*.js

test-cov:
	@./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- -R spec -t 10000 \
	test/*.js \
	test/**/*.js

example:
	./bin/apocalism-cli.js example/example.md

.PHONY: test example

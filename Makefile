SHELL := /bin/bash

lint:
	./node_modules/.bin/jslint ./*.js
	./node_modules/.bin/jslint ./lib/*.js
	./node_modules/.bin/jslint ./lib/phantom-scripts/*.js
	./node_modules/.bin/jslint ./test/*.js

test:
	@./node_modules/.bin/mocha -R spec -t 10000 \
	test/html.js test/pdf.js test/paginator.js test/phantom-wrapper.js test/images.js test/options.js

test-cov:
	@./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- -R spec -t 10000 \
	test/html.js test/pdf.js test/paginator.js test/phantom-wrapper.js test/images.js test/options.js

.PHONY: test

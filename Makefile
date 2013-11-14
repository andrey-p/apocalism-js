SHELL := /bin/bash

lint:
	jslint ./*.js
	jslint ./lib/*.js
	jslint ./lib/phantom-scripts/*.js
	jslint ./test/*.js

test:
	@./node_modules/.bin/mocha -R spec -t 10000 \
	test/html.js test/paginator.js test/pdf.js test/images.js test/options.js

test-cov:
	@./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- -R spec -t 10000 \
	test/html.js test/paginator.js test/pdf.js test/images.js test/options.js

test-pdf:
	@cd test/test_project && ../../bin/apocalism-cli.js ./story.md

.PHONY: test

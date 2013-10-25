SHELL := /bin/bash

lint:
	jslint ./*.js
	jslint ./test/*.js

tests:
	@mocha -R spec -t 10000 test/html.js
	@mocha -R spec -t 10000 test/paginator.js
	@mocha -R spec -t 10000 test/pdf.js
	@mocha -R spec -t 10000 test/images.js
	@mocha -R spec -t 10000 test/options.js

test-pdf:
	@cd test/test_project && ../../main.js ./story.md

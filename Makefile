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
	@./main.js test/test_project/story.md -o test/test_project/output/output.pdf -i ./test/test_project/images/

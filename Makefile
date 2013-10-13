SHELL := /bin/bash

lint:
	jslint ./*.js
	jslint ./test/*.js

tests:
	@mocha -R spec -t 10000 test/html.js
	@mocha -R spec -t 10000 test/paginator.js
	@mocha -R spec -t 10000 test/pdf.js

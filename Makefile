SHELL := /bin/bash

lint:
	jslint ./*.js

unit-test:
	mocha -R spec test/unit/*

integration-test:
	mocha -R spec -t 10000 test/integration/*

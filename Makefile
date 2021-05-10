install:
	npm ci

develop:
	npx webpack serve

build:
	NODE_ENV=production npx webpack

test:
	npm test -- --passWithNoTests

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

.PHONY: test
install:
	npm ci

develop:
	npx webpack serve

build:
	NODE_ENV=production npx webpack

test:
	npm test -- --passWithNoTests

lint:
	npx eslint .

.PHONY: test
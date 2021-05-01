install:
	npm ci

test:
	npm test -- --passWithNoTests

lint:
	npx eslint .

.PHONY: test
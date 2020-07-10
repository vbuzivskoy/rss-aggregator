install: install-deps

install-deps:
	npm ci

devstart:
	npm run dev

dev-server:
	npx webpack-dev-server --mode development --open

builddev:
	NODE_ENV=development npx webpack

build:
	NODE_ENV=production npx webpack

lint:
	npx eslint .

test:
	npm run test

test-coverage:
	npm test -- --coverage
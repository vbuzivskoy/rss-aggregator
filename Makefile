install: install-deps

install-deps:
	npm ci

devstart:
	npx webpack-dev-server --mode development --open

dev:
	NODE_ENV=development npx webpack

build:
	NODE_ENV=production npx webpack

lint:
	npx eslint .

test:
	npx jest
webpack=node_modules/.bin/webpack

all: makerkeeper
	@true

makerkeeper: node_modules web3.js webpack.config.js
	$(webpack) --config webpack.config.js

node_modules: package.json
	npm install

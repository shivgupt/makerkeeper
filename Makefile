# Variable

VPATH=src:ops:build
webpack=node_modules/.bin/webpack
me=$(shell whoami)
version=latest
remote=bonet
contracts=$(shell find contracts -type f -name "*.json")

# Rules

all: makerkeeper
	@true

mk: makerkeeper-image
	docker push $(me)/makerkeeper:$(version)
	scp ops/deploy-mk.sh $(remote):~
	ssh $(remote) bash deploy-mk.sh
	
makerkeeper-image: mk.bundle.js makerkeeper.Dockerfile
	docker build -f ops/makerkeeper.Dockerfile -t $(me)/makerkeeper:$(version) -t makerkeeper:$(version) .
	touch build/makerkeeper-image

mk.bundle.js: node_modules web3.js webpack.config.js $(contracts)
	$(webpack) --config ./ops/webpack.config.js

build/node_modules: package.json package-lock.json
	npm install
	touch build/node_modules

# Variable

VPATH=src:ops:build

me=$(shell whoami)
version=latest
remote=bonet

webpack=node_modules/.bin/webpack

src=$(shell find src -type f -name "*.js")
contracts=$(shell find contracts -type f -name "*.json")

contracts=$(shell mkdir -p build)

# Rules

all: makerkeeper-image
	@true

mk: makerkeeper-image
	docker push $(me)/makerkeeper_node:$(version)
	scp ops/deploy-mk.sh $(remote):~
	ssh $(remote) ETH_ADDRESS=$$ETH_ADDRESS bash deploy-mk.sh
	
makerkeeper-image: mk.bundle.js makerkeeper.Dockerfile
	docker build -f ops/makerkeeper.Dockerfile -t $(me)/makerkeeper_node:$(version) -t makerkeeper_node:$(version) .
	touch build/makerkeeper-image

mk.bundle.js: node_modules webpack.config.js $(contracts) $(src)
	$(webpack) --config ./ops/webpack.config.js

build/node_modules: package.json package-lock.json
	npm install
	touch build/node_modules

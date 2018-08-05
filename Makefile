# Variable

VPATH=src:ops:build

me=$(shell whoami)
version=latest
remote=${remotessh}

webpack=node_modules/.bin/webpack

src=$(shell find src -type f -name "*.js")
contracts=$(shell find contracts -type f -name "*.json")

$(shell mkdir -p build)

# Rules

default: console.bundle.js

all: console-image bot-image
	@true

clean:
	rm -rf build/*

deploy-bot: bot-image
	docker push $(me)/makerkeeper_bot:$(version)
	scp ops/deploy-bot.sh $(remote):~
	ssh $(remote) ETH_ADDRESS=$$ETH_ADDRESS bash deploy-bot.sh

bot-image: bot.bundle.js bot.Dockerfile
	docker build -f ops/bot.Dockerfile -t $(me)/makerkeeper_bot:$(version) .
	touch build/bot-image

bot.bundle.js: node_modules webpack.bot.js $(contracts) $(src)
	$(webpack) --config ./ops/webpack.bot.js
	
deploy-console: console-image
	docker push $(me)/makerkeeper_console:$(version)
	scp ops/deploy-console.sh $(remote):~
	
console-image: console.bundle.js console.Dockerfile
	docker build -f ops/console.Dockerfile -t $(me)/makerkeeper_console:$(version) .
	touch build/console-image


console.bundle.js: node_modules webpack.console.js $(contracts) $(src)
	$(webpack) --config ./ops/webpack.console.js

build/node_modules: package.json package-lock.json
	npm install
	touch build/node_modules

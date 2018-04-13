FROM node:alpine

COPY ./build/console.bundle.js /root/console.js

WORKDIR /root

ENTRYPOINT  ["sleep", "31449600"]

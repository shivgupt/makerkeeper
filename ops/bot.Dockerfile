FROM node:alpine

COPY ./build/bot.bundle.js /root/bot.js

WORKDIR /root

ENTRYPOINT  ["node"]

CMD ["/root/bot.js"]

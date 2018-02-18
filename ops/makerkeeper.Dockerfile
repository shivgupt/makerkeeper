FROM node:alpine

COPY ./build/mk.bundle.js /root/mk.js

WORKDIR /root

ENTRYPOINT  ["node"]

CMD ["/root/mk.js"]

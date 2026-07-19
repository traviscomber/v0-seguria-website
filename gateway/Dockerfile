FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY src ./src

RUN mkdir -p /app/data

VOLUME ["/app/data"]
CMD ["node", "src/index.js"]

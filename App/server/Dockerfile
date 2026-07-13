FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
COPY seeds ./seeds

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]

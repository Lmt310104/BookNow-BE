FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . . 
RUN npm run build

FROM node:22-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/main"]

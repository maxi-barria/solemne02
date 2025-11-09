FROM node:18-bullseye AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm ci --include=dev

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

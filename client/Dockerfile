FROM node:20-alpine3.17 AS builder

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install

COPY . /app

RUN npm run build

FROM nginx:1.25.2-alpine-slim
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5100

CMD ["nginx", "-g", "daemon off;"]

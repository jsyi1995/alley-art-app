FROM node:20-alpine3.17

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install

COPY . /app

EXPOSE 8080

CMD ["npm", "run", "start"]
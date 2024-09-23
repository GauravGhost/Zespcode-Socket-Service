FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /app

RUN git clone https://github.com/GauravGhost/Zespcode-Socket-Service.git .

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
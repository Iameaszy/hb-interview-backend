FROM node:8

WORKDIR /home/nodejs/hb-interview-backend

COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV development
EXPOSE 3000
cmd ['npm','start']

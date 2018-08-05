FROM node:8

WORKDIR /app
COPY package.json /app/
RUN npm install -dd
COPY . .
EXPOSE 3000
CMD ["npm","start"]

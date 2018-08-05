FROM node:8

WORKDIR /app
COPY package.json /app/
RUN npm config set registry https://registry.npmjs.org/
RUN npm install -dd
COPY . .
EXPOSE 3000
CMD ["npm","start"]

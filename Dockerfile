FROM node:14.18.0-alpine
RUN apk add g++ make py3-pip
EXPOSE 8080
RUN mkdir /app
WORKDIR /app
COPY . /app
RUN npm install
CMD ["node", "index.js"]
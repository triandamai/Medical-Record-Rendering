FROM node:16.15.0
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -qq build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev g++ software-properties-common 
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt install python3.7 -y
RUN npm config set python /usr/bin/python
RUN npm install -g node-gyp
RUN npm i -g node-pre-gyp
RUN npm install node-libcurl --build-from-source
RUN npm i canvas@2.9.1 
RUN npm install -d
COPY . .
EXPOSE 3000
CMD ["node","index.js"]
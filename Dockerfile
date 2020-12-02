# get latest node
FROM node:latest

# install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# make workdir
WORKDIR /usr/src/bot

# install deps
COPY package*.json ./
RUN npm install

# copy project files and build
COPY . .

# start project
CMD ["npm", "run", "spawn"]
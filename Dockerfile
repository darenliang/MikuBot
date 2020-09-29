# get latest node
FROM node:latest

# install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# make workdir
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# install deps
COPY package.json /usr/src/bot
RUN npm install

# copy project files and build
COPY . /usr/src/bot
RUN npm run build

# start project
CMD ["npm", "run", "spawn"]
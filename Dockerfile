# get latest lts node
FROM node:lts

# get pip and ffmpeg
RUN apt-get update && apt-get install -y \
    python3-pip ffmpeg libtool

# install yt-dlp
RUN pip3 install yt-dlp

# make workdir
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm install

# copy project files and build
COPY . .
RUN npm run build

# start project
CMD ["npm", "run", "spawn"]

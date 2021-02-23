# get latest node
FROM node:latest

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
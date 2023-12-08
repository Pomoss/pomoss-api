# This is CloudRun docker file

# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:18-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy files and folders to build
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY dist ./dist
COPY .env ./
COPY package.json ./
COPY yarn.lock ./

RUN yarn &&\
    npx prisma generate

CMD [ "yarn", "start" ]
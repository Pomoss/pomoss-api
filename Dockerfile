# This is CloudRun docker file

# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:18-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy built files
COPY . ./

# Install packages and generate prisma client
RUN yarn && npx prisma generate

CMD [ "yarn", "start" ]
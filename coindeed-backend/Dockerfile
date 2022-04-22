FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .
# Prisma issue where prisma must be installed before @prisma/client
RUN yarn remove prisma 
RUN yarn remove @prisma/client
RUN yarn add prisma @prisma/client


RUN yarn build

EXPOSE 4000
CMD [ "yarn", "start" ]

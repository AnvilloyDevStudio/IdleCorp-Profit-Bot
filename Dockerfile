# syntax=docker/dockerfile:1
FROM node
RUN npm install
RUN ["node", "index.js"]
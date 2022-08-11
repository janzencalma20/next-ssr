FROM node:12 as build-stage

# set working directory
WORKDIR /app/

COPY ./ /app/
RUN npm install

RUN npm run build

CMD ["npm", "run", "start"]
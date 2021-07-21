FROM node:14.15.4

LABEL author='Ngo Tuan Anh, email: anhnt.vnist@gmail.com'

WORKDIR /usr/src/app

COPY package.json .

RUN yarn install

COPY . . 

ENV PORT 3000
ENV HOST localhost
ENV NODE_ENV development

RUN yarn build



CMD ["yarn", "start"]

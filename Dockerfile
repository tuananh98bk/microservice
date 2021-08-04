FROM node:14-alpine AS builder

LABEL author='Ngo Tuan Anh, email: anhnt.vnist@gmail.com'

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        g++ \
        make \
        automake \
        autoconf \
        bzip2 \
        unzip \
        wget \
        sox \
        libtool \
        git \
        subversion \
        python2.7 \
        python3 \
        zlib1g-dev \
        ca-certificates \
        gfortran \
        patch \
        ffmpeg \
	vim && \
    rm -rf /var/lib/apt/lists/*

RUN npm install --only=builder

COPY . ./

ENV PORT 3000
ENV HOST localhost
ENV NODE_ENV development

RUN npm run build

COPY . /usr/src/app

CMD ["node", "dist/main"]

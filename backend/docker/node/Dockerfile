FROM node:10.16.3

# Make sure base image is updated
RUN apt-get -qq update
RUN apt-get -qq -y install \
    apt-utils \
    apt-transport-https

# Create work dir
RUN mkdir -p /jobtogo/backend
WORKDIR /jobtogo/backend

# Install packages
COPY package.json .
COPY package-lock.json .

RUN npm install

# Expose server port
EXPOSE 8080

STOPSIGNAL SIGINT

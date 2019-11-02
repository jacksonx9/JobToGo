FROM node:10.16.3

# Make sure base image is updated
RUN apt-get -qq update && \
    apt-get -qq -y install --no-install-recommends \
    apt-utils=1.4.9 \
    apt-transport-https=1.4.9 \
    xpdf=3.04-4 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

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

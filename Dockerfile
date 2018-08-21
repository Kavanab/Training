# Dockerfile for: Customer Search angularjs app running on node.js

# Pull the base ubuntu image from the Docker public repository.
FROM debian:wheezy

# this lets the host know we're running headless (to suppress apt errors)
ENV DEBIAN_FRONTEND noninteractive

# install the necessary packages
RUN apt-get update && \
    apt-get install -y git wget && \
    wget http://nodejs.org/dist/v0.12.7/node-v0.12.7-linux-x64.tar.gz && \
    tar -C /usr/local --strip-components 1 -xzf node-v0.12.7-linux-x64.tar.gz && \
    git clone https://github.wm.com/caag/customer-search.git /customer-search && \
    apt-get clean && \
    apt-get purge -y git wget && \
    apt-get autoremove -y && \
    rm -fr /node-v0.12.7-linux-x64.tar.gz && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /customer-search

RUN npm config set registry http://registry.npmjs.org/; npm install -g gulp; npm install && \
    gulp && \
    rm -fr node_modules && \
    npm install --production && \
    rm -fr src

# Our application starts a server on port 8080 so we need to expose it outside the container.  The EXPOSE instruction will have it mapped by the docker daemon.
EXPOSE 8080

# Define the command to run the app using CMD which defines your runtime, i.e. node, and the path to our app, i.e. src/index.js
CMD ["node", "/customer-search/web.js"]

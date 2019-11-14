#!/bin/bash

set -e

cd backend

mkdir credentials
echo ' { "clientID": "encrypted.apps.googleusercontent.com" }' > credentials/google.json

docker-compose build --parallel

cd -

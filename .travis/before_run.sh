#!/bin/sh
# set -e
cd backend
mkdir credentials
echo ' { "clientID": "encrypted.apps.googleusercontent.com" }' > credentials/google.json
docker-compose down
docker-compose up
#!/bin/bash

set -e

cd backend

mkdir credentials
cp ../travis/backend/dummy_credentials/* credentials/

docker-compose build --parallel

cd -

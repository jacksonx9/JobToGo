#!/bin/bash

set -e

cd backend

docker-compose run node npm run coverage

cd -

#!/bin/bash

set -e

cd frontend

mkdir credentials
cp ../travis/frontend/dummy_credentials/credentials.json credentials/
cp ../travis/frontend/dummy_credentials/google-services.json android/app/

echo no | android create avd --force -n Pixel_API_28 -t android-16 --abi armeabi-v7a -c 100M

wget https://raw.githubusercontent.com/creationix/nvm/v0.31.0/nvm.sh -O ~/.nvm/nvm.sh
source ~/.nvm/nvm.sh
nvm install 10.17.0

npm install -g react-native-cli detox-cli
npm install

source ~/.nvm/nvm.sh
detox build

cd -

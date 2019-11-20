#!/bin/bash

set -e

cd frontend
source ~/.nvm/nvm.sh

emulator -avd Pixel_API_28 -no-audio -no-window -no-skin &
android-wait-for-emulator
adb shell input keyevent 82

react-native start &
detox test

cd -

# JobToGo

[![Build Status](https://travis-ci.com/jacksonx9/JobToGo.svg?token=TUsnJznHqMLLvpddyrtn&branch=master)](https://travis-ci.com/jacksonx9/JobToGo)

> Effortless job search on the go

## Running the server

```bash
cd backend
sudo docker-compose up
```

## Running the mobile app

Read the tutorial at <https://facebook.github.io/react-native/docs/getting-started> using react-native-cli to set up the environment.

Then, with your device connected, 

```bash
cd frontend
react-native start &
react-native run-android # or run-ios
```

## Backend testing

```bash
sudo docker-compose run node npm run test # run all tests
sudo docker-compose run node npm run test <name> # run specific tests
sudo docker-compose run node npm run test:watch # watch tests
sudo docker-compose run node npm run coverage # generate coverage report
```

Once generated, the report can be viewed at `backend/coverage/lcov-report/index.html`

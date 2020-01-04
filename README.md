<p align="center">
  <img width=290 height=83 src="frontend/assets/logo-light.png" />
</p>
<h3 align="center">Effortless job search on the go</h3>
<h4 align="center">First Place Winner for UBC Software Engineering 2019</h4>
<p align="center">
  <img
    src="https://travis-ci.com/jacksonx9/JobToGo.svg?token=TUsnJznHqMLLvpddyrtn&branch=master"
    alt="Build Status"
  />
  <img
    src="https://api.codacy.com/project/badge/Grade/7d44b3adcee346a58e50d496938f7f4c"
    alt="Code Coverage"
  />
</p>
<p align="center">
  <img src="screenshots/jobtogo.gif" alt="Demo"
</p>

<p align="center">
  <a href="https://www.youtube.com/watch?v=-J0DWfPJhk4&feature=youtu.be">View the full demo of Job To Go</a>
</p>


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

sudo docker-compose run node npm run test src # run only unit tests
sudo docker-compose run node npm run test inttests # run only integration tests
sudo docker-compose run node npm run coverage src # generate only unit coverage
sudo docker-compose run node npm run coverage inttests # run only integration coverage
```

Once generated, the report can be viewed at `backend/coverage/lcov-report/index.html`

# [Tenno.tv](https://tenno.tv)

[![Greenkeeper badge](https://badges.greenkeeper.io/WFCD/tennotv.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/WFCD/tennotv.svg?branch=master)](https://travis-ci.org/WFCD/tennotv)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![Supported by Warframe Community Developers](https://warframestat.us/wfcd.png)](https://github.com/WFCD "Supported by Warframe Community Developers")


# Contribute

At the moment, we aren't looking for contributors, as we are preparing for an initial release.

If you have any interest in contributing or any feature requests, feel free to add an issue or feature request.


## Prerequisite
In order to run your own version of Warframe Hub, you are required to have the following on your machine:
 * [Node 8.x](https://nodejs.org/en/) for running the project
 * [NPM 5.x](https://www.npmjs.com/get-npm) for dependency control, usually installed with Node.js

## Dependencies
Most software related dependencies should be managed by NPM, and will be automatically installed when you try to run the project. We'll cover those dependencies in the following section.

Warframe Hub also relies on the availability of the internet, as it will parse the Warframe WorldState. It uses a slightly easier to parse WorldState provided by [Warframe Stat](https://warframestat.us/)

## Installation
Clone or download and unpack this repository. Install the dependencies using NPM
```bash
$ npm install
```
If everything goes well, it should tell you the number of packages it has installed. Then you can try to run it and hope everything goes well.
```bash
$ npm start
```
The express website should be accessible at http://localhost:3000

## Bug/Issue Report
Found a bug or an issue? Please submit a bug/issue report under the issue tab.

## Testing
Our builds goes through Travis-CI's tester.

You can see the latest results [here](https://travis-ci.org/WFCD/tennotv) or by clicking on the badge at the top of the page.

The repo also includes a mocha script that is used for Travi CI's unit testing. You can run this manually by installing mocha first globally on your machine, then run the specifications named mochaspec.js
```bash
$ npm install -g mocha
$ mocha spec mochaspec.js
```

Another things that's very helpful for development is nodemon. This will automatically restart the express server if any changes is detected in the project folder. No more restarting the node server manually! Just run it in the project directory and it should take care of the rest.
```bash
$ npm install -g nodemon
$ nodemon
```

## License
The distribution of this software is protected under [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

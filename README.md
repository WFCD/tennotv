# [Tenno.tv](https://tenno.tv)

[![Greenkeeper badge](https://badges.greenkeeper.io/WFCD/tennotv.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/WFCD/tennotv.svg?branch=master)](https://travis-ci.com/WFCD/tennotv)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Supported by the Warframe Community Developers](https://img.shields.io/badge/Warframe_Comm_Devs-supported-blue.svg?color=2E96EF&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOTgiIGhlaWdodD0iMTczIiB2aWV3Qm94PSIwIDAgMjk4IDE3MyI%2BPHBhdGggZD0iTTE4NSA2N2MxNSA4IDI4IDE2IDMxIDE5czIzIDE4LTcgNjBjMCAwIDM1LTMxIDI2LTc5LTE0LTctNjItMzYtNzAtNDUtNC01LTEwLTEyLTE1LTIyLTUgMTAtOSAxNC0xNSAyMi0xMyAxMy01OCAzOC03MiA0NS05IDQ4IDI2IDc5IDI2IDc5LTMwLTQyLTEwLTU3LTctNjBsMzEtMTkgMzYtMjIgMzYgMjJ6TTU1IDE3M2wtMTctM2MtOC0xOS0yMC00NC0yNC01MC01LTctNy0xMS0xNC0xNWwxOC0yYzE2LTMgMjItNyAzMi0xMyAxIDYgMCA5IDIgMTQtNiA0LTIxIDEwLTI0IDE2IDMgMTQgNSAyNyAyNyA1M3ptMTYtMTFsLTktMi0xNC0yOWEzMCAzMCAwIDAgMC04LThoN2wxMy00IDQgN2MtMyAyLTcgMy04IDZhODYgODYgMCAwIDAgMTUgMzB6bTE3MiAxMWwxNy0zYzgtMTkgMjAtNDQgMjQtNTAgNS03IDctMTEgMTQtMTVsLTE4LTJjLTE2LTMtMjItNy0zMi0xMy0xIDYgMCA5LTIgMTQgNiA0IDIxIDEwIDI0IDE2LTMgMTQtNSAyNy0yNyA1M3ptLTE2LTExbDktMiAxNC0yOWEzMCAzMCAwIDAgMSA4LThoLTdsLTEzLTQtNCA3YzMgMiA3IDMgOCA2YTg2IDg2IDAgMCAxLTE1IDMwem0tNzktNDBsLTYtNmMtMSAzLTMgNi02IDdsNSA1YTUgNSAwIDAgMSAyIDB6bS0xMy0yYTQgNCAwIDAgMSAxLTJsMi0yYTQgNCAwIDAgMSAyLTFsNC0xNy0xNy0xMC04IDcgMTMgOC0yIDctNyAyLTgtMTItOCA4IDEwIDE3em0xMiAxMWE1IDUgMCAwIDAtNC0yIDQgNCAwIDAgMC0zIDFsLTMwIDI3YTUgNSAwIDAgMCAwIDdsNCA0YTYgNiAwIDAgMCA0IDIgNSA1IDAgMCAwIDMtMWwyNy0zMWMyLTIgMS01LTEtN3ptMzkgMjZsLTMwLTI4LTYgNmE1IDUgMCAwIDEgMCAzbDI2IDI5YTEgMSAwIDAgMCAxIDBsNS0yIDItMmMxLTIgMy01IDItNnptNS00NWEyIDIgMCAwIDAtNCAwbC0xIDEtMi00YzEtMy01LTktNS05LTEzLTE0LTIzLTE0LTI3LTEzLTIgMS0yIDEgMCAyIDE0IDIgMTUgMTAgMTMgMTNhNCA0IDAgMCAwLTEgMyAzIDMgMCAwIDAgMSAxbC0yMSAyMmE3IDcgMCAwIDEgNCAyIDggOCAwIDAgMSAyIDNsMjAtMjFhNyA3IDAgMCAwIDEgMSA0IDQgMCAwIDAgNCAwYzEtMSA2IDMgNyA0aC0xYTMgMyAwIDAgMCAwIDQgMiAyIDAgMCAwIDQgMGw2LTZhMyAzIDAgMCAwIDAtM3oiIGZpbGw9IiMyZTk2ZWYiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg%3D%3D)](https://github.com/WFCD/banner/blob/master/PROJECTS.md)
[![Discord](https://img.shields.io/discord/388449525649375252.svg?logo=discord)](https://discord.gg/D9QFuZR)


# Contribute

If you have any interest in contributing or any feature requests, feel free to add an issue or feature request, and if you'd like to implement it, feel free to give it a shot.


## Prerequisite
In order to run your own version of Warframe Hub, you are required to have the following on your machine:
 * [Node 8.x](https://nodejs.org/en/) for running the project
 * [NPM 5.x](https://www.npmjs.com/get-npm) for dependency control, usually installed with Node.js

## Dependencies
Most software related dependencies should be managed by NPM, and will be automatically installed when you try to run the project. We'll cover those dependencies in the following section.

Tenno.tv relies on connection to the internet as we include data from an outside api.

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

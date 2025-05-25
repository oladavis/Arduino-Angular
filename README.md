# Arduino-Node-Angular
A complete end-to-end starter project for send/receive commands from an Arduino board on web using Angular. 

This project consists of three parts:

1. [Arduino firmware](arduino)
2. [Node server](serial-websocket)
3. [Angular client](angular-websocket-client)

The arduino firmware and Node server should run on the same device. The Angular client can run on any web device that can connect to the Node server through network.


![Screenshot](https://raw.githubusercontent.com/ourarash/serial-websocket/master/screenshot.gif)


#Installation

## Node server:
```bash
git clone https://github.com/ourarash/arduino-node-angular.git
cd arduino-node-angular/serial-websocket/
npm install
node examples/simple.js
```

## Angular client:
```bash
git clone https://github.com/ourarash/arduino-node-angular.git
cd arduino-node-angular/angular-websockets-client
npm install
ng serve
```


# Arduino-Node-Angular
A complete end-to-end starter project for send/receive commands from an Arduino board on web using Angular. 

This project consists of three parts:

1. [Arduino firmware](arduino)
2. [Node server](serial-websocket)
3. [Angular client](angular-websocket-client)

The arduino firmware and Node server should run on the same device. The Angular client can run on any web device that can connect to the Node server through network.

![Screenshot](https://github.com/ourarash/arduino-node-angular/raw/master/serial-websocket/screenshot.gif | width=50)


# Installation

## Arduino
```bash
git clone https://github.com/ourarash/arduino-node-angular.git
```
Then program [arduino-node-angular/arduino/serial/serial.ino] to your board.

Find out the name of the serial port from Arduino Tools menu.

## Node server:
```bash
git clone https://github.com/ourarash/arduino-node-angular.git
cd arduino-node-angular/serial-websocket/
npm install
node examples/simple.js --serialPortName="<SERIAL_PORT_NAME>" --serialPortNameRate=9600 --webSocketPortNumber=8081
```

## Angular client:
```bash
git clone https://github.com/ourarash/arduino-node-angular.git
cd arduino-node-angular/angular-websockets-client
npm install
ng serve
```


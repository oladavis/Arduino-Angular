# serial-websocket
A bidirectional websocket to serial port server bridge. It can be used to send/receive commands into an Arduino or Raspberry Pi board through web.

- [x] Receives data from websocket and sends it into the serial port
- [x] Receives data from the serial port and sends it into the websocket
- [x] Supports multiple websocket connections
- [x] [Arduino serial connection and Angular client example](https://github.com/ourarash/arduino-node-angular) are provided

[![NPM](https://badge.fury.io/js/serial-websocket.svg)](https://www.npmjs.com/package/serial-websocket)

<!-- [![NPM Downloads][downloadst-image]][downloads-url] -->

[downloads-image]: https://img.shields.io/npm/dm/serial-websocket.svg
[downloadst-image]: https://img.shields.io/npm/dt/serial-websocket.svg
[downloads-url]: https://npmjs.org/package/serial-websocket

#Installation
```bash
npm install serial-websocket --save
```


# Usage

```javascript
let options = {
  serialPort: {
    name: "/dev/cu.usbmodem142301", // Name of the serial port
    rate: 9600 // Baud rate
  },
  webSocketPortNumber: 8081
};

const serial_websocket = require("serial-websocket")(options);
serial_websocket.start();
```
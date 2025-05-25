let options = {
  serialPort: {
    name: "/dev/cu.usbmodem142301",
    rate: 9600
  },
  webSocketPortNumber: 8081
};

const serial_websocket = require("../lib/serial-websocket")(options);
serial_websocket.start();

/*
Serial-to-websocket Server
using serialport.js

To call this type the following on the command line:
node wsServer.js portName

where portname is the name of your serial port, e.g. /dev/tty.usbserial-xxxx (on OSX)

created 28 Aug 2015
modified 5 Nov 2017
by Tom Igoe

*/

//-----------------------------------------------------------------------------
const util = require("util");
const moment = require("moment");
var momentDurationFormatSetup = require("moment-duration-format");
const numeral = require("numeral");

var defines = require("./defines");
var Globals = defines.Globals;
var log = defines.log;
// include the various libraries that you'll use:
var SerialPort = require("serialport"); // include the serialport library
var WebSocketServer = require("ws").Server; // include the webSocket library

// configure the webSocket server:
var wss = new WebSocketServer({ port: Globals.options.server_port });

var devicePort;

var Readline = SerialPort.parsers.Readline; // make instance of Readline parser
var parser = new Readline(); // make a new parser to read ASCII lines
//-----------------------------------------------------------------------------
async function listSerialPorts() {
  const serialPortList = util.promisify(SerialPort.list);
  log.info("Listing serial ports...");

  try {
    let ports = await serialPortList();
    ports.forEach((port, i) => {
      log.info(`Port ${i}: `.green, JSON.stringify(port, null, 2));
    });
  } catch (error) {
    log.error(error);
  }
}
//-----------------------------------------------------------------------------
/**
 * Initializes the serial
 */
function devicePortInit() {
  log.info(
    `Initializing serial port: `,
    `Name:`.green,
    ` ${Globals.options.serialPort.name}, `,
    `Baud Rate:`.green,
    ` ${Globals.options.serialPort.rate}`
  );
  devicePort = new SerialPort(
    Globals.options.serialPort.name,
    Globals.options.serialPort.rate
  );
  devicePort.pipe(parser); // pipe the serial stream to the parser

  // called when the serial port opens
  devicePort.on("open", () => {
    log.info(`Serial port successfully opened!`.green);
    Globals.serialPortStatus = "open";
  });

  devicePort.on("close", () => {
    log.info("port closed.");
    Globals.serialPortStatus = "closed";
  });

  devicePort.on("error", error => {
    log.error("Serial port error: " + error);
    log.info(
      `Will retry connection in ${
        Globals.options.serialConnectRetryIntervalInSeconds
      } seconds`
    );
    setTimeout(() => {
      devicePortInit();
    }, Globals.options.serialConnectRetryIntervalInSeconds * 1000);
  });

  // called when there's new data incoming
  parser.on("data", readSerialData);
}

//-----------------------------------------------------------------------------
/**
 * broadcasts messages to all webSocket clients
 * @param {object} data
 */
function broadcast(data) {
  for (let c of Globals.wsConnections) {
    c.send(JSON.stringify(data));
  }
}
//-----------------------------------------------------------------------------
/**
 * Called when new data comes into the serial port:
 * @param {object} data
 */
function readSerialData(data) {
  // if there are webSocket Globals.wsConnections, send the serial data
  // to all of them:
  log.info("Serial READ:".green, data);
  if (Globals.wsConnections.length > 0) {
    broadcast(data);
  }
  Globals.serialPortReadBytes += data.length;
}
//-----------------------------------------------------------------------------
/**
 *
 * @param {object} data
 */
function sendToSerial(data) {
  log.info("Sending to serial: " + data);
  devicePort.write(data);
  Globals.serialPortWriteBytes += data.length;
}

//-----------------------------------------------------------------------------
// webSocket Server event functions
//-----------------------------------------------------------------------------
/**
 *
 * @param {object} client
 */
function handleConnection(client) {
  log.info(`New websocket Connection established!`.yellow);
  try {
    // log.info(`client object:  ${JSON.stringify(client, null, 2)}`.darkGray);
  } catch (error) {}
  // add this client to the Globals.wsConnections array
  Globals.wsConnections.push(client);

  log.info(
    `Number of connected websocket clients: ${Globals.wsConnections.length}`.yellow
  );

  client.on("message", sendToSerial);

  client.on("close", () => {
    log.info("Web socket connection closed".yellow);
    //Delete client from the array
    var position = Globals.wsConnections.indexOf(client);
    Globals.wsConnections.splice(position, 1);
  });
}

//-----------------------------------------------------------------------------
/**
 * Start
 */
async function start() {
  log.info("Start...");
  log.info(
    "-----------------------------------------------------------------------------"
  );
  await listSerialPorts();
  devicePortInit();
  wss.on("connection", handleConnection);
  Globals.options.enable = true;

  Globals.intervals.statusBarTextInterval = setInterval(() => {
    if (Globals.options.enable) {
      updateStatusBar();
    }
  }, Globals.statusBarTextInterval_ms);
}
//-----------------------------------------------------------------------------
var g_printStatusCounter = 0;
function updateStatusBar() {
  let curTime = moment().valueOf();

  // let elapsedTime = moment
  //   .duration(curTime - defines.Globals.startTime)
  //   .format("h[h]:mm[m]:s[s]");

  // let frames = log.getSpinners().point.frames;
  let frames1 = ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "●●●", "∙∙∙", "●●●"];
  let frames2 = ["∙∙∙", "∙∙●", "∙●∙", "●∙∙", "●●●", "∙∙∙", "●●●"];

  let frameNumber1 = g_printStatusCounter % frames1.length;
  let frameNumber2 = frameNumber1;
  g_printStatusCounter++;
  let spinner1 = frames1[frameNumber1].toString();
  let spinner2 = frames2[frameNumber2].toString();

  if (frameNumber1 < frames1.length - 1) {
    spinner1 = spinner1.green;
    spinner2 = spinner2.green;
  } else {
    spinner1 = spinner1.green.bright;
    spinner2 = spinner2.green.bright;
  }

  let serialPortStatusText = `Serial port: `;
  if (Globals.serialPortStatus === `open`) {
    serialPortStatusText +=
      `open`.green +
      ` Baud Rate: ` +
      Globals.options.serialPort.rate.toString().green +
      `, Read: ` +
      numeral(Globals.serialPortReadBytes)
        .format("0 a")
        .toString().green+
        `, Write: ` +
        numeral(Globals.serialPortWriteBytes)
          .format("0 a")
          .toString().green;
  } else {
    serialPortStatusText +=`closed`.red;
  }

  let wsText = `, WS connections: `;
  if (Globals.wsConnections.length > 0) {
    wsText += Globals.wsConnections.length.toString().green;
  } else {
    wsText += Globals.wsConnections.length.toString().red;
  }
  let statusBarText = Array(2);
  statusBarText[0] = `-----------------------------------------------------------------------------`;
  statusBarText[1] = spinner1 + " " + serialPortStatusText + wsText;

  log.setStatusBarText(statusBarText);
}
//-----------------------------------------------------------------------------
start();
//-----------------------------------------------------------------------------
module.exports = function(options = {}) {
  Object.assign(Globals.options, options);
  return {
    stop: stop,
    start: start,
    log: log
  };
};

/**
 * Connects serial port to web socket
 * By: Ari Saif
 */
//-----------------------------------------------------------------------------
const util = require("util");
const moment = require("moment");
var momentDurationFormatSetup = require("moment-duration-format");
const numeral = require("numeral");

var defines = require("./defines");
var Globals = defines.Globals;
var log = defines.log;

var SerialPort = require("serialport");
var WebSocketServer = require("ws").Server;

var devicePort;

var Readline = SerialPort.parsers.Readline;
var parser = new Readline();
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
    ` ${Globals.options.serialPortName}, `,
    `Baud Rate:`.green,
    ` ${Globals.options.serialPortRate}`
  );
  devicePort = new SerialPort(
    Globals.options.serialPortName,
    Globals.options.serialPortRate
  );
  devicePort.pipe(parser);

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
      `Will retry in ${
        Globals.options.serialConnectRetryIntervalInSeconds
      } seconds`
    );

    broadcast(
      "Error in opening serial port. " +
        `Will retry in ${
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
    c.send(data);
  }
}
//-----------------------------------------------------------------------------
/**
 * Called when new data comes into the serial port:
 * @param {object} data
 */
function readSerialData(data) {
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
  log.info(`Received from websocket: `.yellow, data.toString().green);
  log.info("Sending to serial: ", data.toString().green);
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
  } catch (error) {}
  // add this client to the Globals.wsConnections array
  Globals.wsConnections.push(client);

  log.info(
    `Number of connected websocket clients: ${Globals.wsConnections.length}`
      .yellow
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
  if (Globals.options.listSerialPorts) {
    await listSerialPorts();
  }
  devicePortInit();
  let webSocket;
  try {
    webSocket = new WebSocketServer({ port: Globals.options.webSocketPortNumber });
    webSocket.on("connection", handleConnection);
  } catch (error) {
    log.error(error);
    return;
  }

  Globals.options.enable = true;

  Globals.intervals.statusBarTextInterval = setInterval(() => {
    if (Globals.options.enable) {
      updateStatusBar();
    }
  }, Globals.statusBarTextInterval_ms);
}
//-----------------------------------------------------------------------------
async function stop() {
  Globals.options.enable = false;
}
//-----------------------------------------------------------------------------
var g_printStatusCounter = 0;
function updateStatusBar() {
  let curTime = moment().valueOf();

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

  let serialPortStatusText = `Serial prt: `;
  if (Globals.serialPortStatus === `open`) {
    serialPortStatusText +=
      `open`.green +
      ` Baud Rate: ` +
      Globals.options.serialPortRate.toString().green +
      `, Read: ` +
      numeral(Globals.serialPortReadBytes)
        .format("0 a")
        .toString().green +
      `, Write: ` +
      numeral(Globals.serialPortWriteBytes)
        .format("0 a")
        .toString().green;
  } else {
    serialPortStatusText += `closed`.red;
  }

  let wsText = `, WS connections: `;
  if (Globals.wsConnections.length > 0) {
    wsText += Globals.wsConnections.length.toString().green;
  } else {
    wsText += Globals.wsConnections.length.toString().red;
  }
  
  let statusBarText = Array(2);
  statusBarText[0] = `-----------------------------------------------------------------------------`.white;
  statusBarText[1] = spinner1 + " " + serialPortStatusText + wsText;

  log.setStatusBarText(statusBarText);
}
//-----------------------------------------------------------------------------
module.exports = function(options = {}) {
  Object.assign(Globals.options, options);
  return {
    stop: stop,
    start: start,
    log: log
  };
};

/**
 * Angular web socket client
 * By: Ari Saif
 */

import { Component } from '@angular/core';
let msgArray = [];
let component;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'Angular Websocket Client';
  wsAddress = "ws://localhost:8081";
  socket :any;
  data = "Hi from Angular!";

  wsStatus = "disconnected";
  sendButtonEnable = true;

  constructor() {
    component = this;
    console.log("We are in constructor");
    this.connect();
  }

  /**
   * Connects through websocket
   */
  connect() {
    msgArray = [];
    // The socket connection needs two event listeners:
    try {
      this.socket = new WebSocket(this.wsAddress);
      this.socket.onopen = this.openSocket(this);

      this.socket.onerror = this.errorSocket;
      this.socket.onmessage = this.showData;

    } catch (error) {
      console.log("Error in creating socket: ", JSON.stringify(error));
      alert("Error in creating socket: " + error);
    }
  }

  openSocket(component) {
    console.log("Socket opened!");
    component.wsStatus = "connected";
    console.log('this.wsStatus: ', JSON.stringify(this.wsStatus));
  }

  errorSocket(error) {
    console.log("Error in creating the socket: " + JSON.stringify(error));
    alert("Error in creating the socket");
    component.wsStatus = 'closed';

  }

  closeSocket() {
    console.log("Closing socket")
    this.socket.close();
    this.wsStatus = "disconnected";
  }

  /**
   * Handles receive of websocket data
   * @param result object
   */
  showData(result: any) {
    // Remove new line characters
    let msg = result.data.replace(/(\\r\\n|\\n|\\r)/gm, "");
    console.log('received: ', JSON.stringify(msg));
    if (msgArray) {
      msgArray = [msg].concat(msgArray);
    }

    // console.log('this.msgArray: ', JSON.stringify(msgArray));

    if (msgArray.length > 20) {
      msgArray.pop();
    }

  }

  getMsgArray() {
    return msgArray;
  }


  /**
   * Send data to websocket
   */
  async sendData() {
    this.sendButtonEnable = false;
    console.log("Sending data: ", this.data);
    await this.socket.send(this.data);
    this.sendButtonEnable = true;
  }

}

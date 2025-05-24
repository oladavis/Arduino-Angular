import { Component } from '@angular/core';
let i = [];
let component;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'Angular Websocket Client';
  wsAddress = "ws://localhost:8081";
  socket;
  data = "Hi from Angular!";

  wsStatus = "closed";

  constructor() {
    component = this;
    console.log("We are in constructor");
    this.connect();
  }

  connect() {
    i=[];
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
    component.wsStatus = "open";
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
    this.wsStatus = "closed";
  }

  /**
   * Handles receive of websocket data
   * @param result object
   */
  showData(result: any) {
    // Remove new line characters
    let msg = result.data.replace(/(\\r\\n|\\n|\\r)/gm, "");
    console.log('received: ', JSON.stringify(msg));
    if (i) {
      i.push(msg);
    }

    // console.log('this.i: ', JSON.stringify(i));

    if (i.length > 20) {
      i.shift();
    }

  }

  getArray() {
    return i;
  }


  sendData() {
    console.log("Sending data: ", this.data);
    this.socket.send(this.data);
  }

  sendGame(n: number) {
    // ledNumber, pushButtonNumber, Duration, Blocking
    // let game1 = 
    // [[1, 1, 100, false],
    // [2, 1, 100, false],
    // [3, 1, 100, false]];

    let game1 =
      [1, 1, 100, 0];

    // [[1,2], [3,4], [5, 6]]
    console.log('game1: ', JSON.stringify(game1));
    this.socket.send(game1.join(','));
    // for(let e of game1){
    //   this.socket.send(e.toString());

    // }
  }


}

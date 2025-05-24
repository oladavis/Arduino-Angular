import { Component } from '@angular/core';
let i = [];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-websockets-client';
  i = [];
  socket;
  constructor() {
    // this.i = [];
    console.log("We are in constructor");
    console.log('this.i: ', JSON.stringify(this.i));
    this.connect();
  }

  connect() {
    // The socket connection needs two event listeners:
    this.socket = new WebSocket("ws://localhost:8081");

    this.socket.onopen = this.openSocket;
    this.socket.onmessage = this.showData;
    // this.socket.onclose = this.closeSocket;
  }

  openSocket() {
    // this.text.html("Socket open");
    // this.socket.send("Hello server");
  }
  closeSocket(){
    console.log("Closing socket")
    this.socket.close();
  }

  showData(result: any) {
    let str2 = result.data.replace(/(\\r\\n|\\n|\\r)/gm, "");
    console.log('str2: ', JSON.stringify(str2));
    if (i) {
      i.push(str2);
    }

    console.log('this.i: ', JSON.stringify(i));

    if (i.length > 20) {
      i.shift();
    }

  }

  getArray() {
    return i;
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

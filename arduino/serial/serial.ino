/*
* Serial port demo
* By: Ari Saif
*/
#include <string.h>
//---------------------------------------
int i = 0;
int incomingByte = 0; // for incoming serial data
const int frameSize = 6;
String frames[frameSize] = {".", "..", "...", "..", ".", ""};
unsigned long prevTime = 0;

void setup()
{
  Serial.begin(9600);
  prevTime = millis();
}



void loop()
{

  if (millis() - prevTime > 1000) {
    Serial.println("Arduiono: (" + String(i++) + "): Listening for commands" +
                   frames[i % frameSize]
                  );
    prevTime = millis();
  }

  if (Serial.available() > 0)
  {
    String s = Serial.readString();
    Serial.print("Arduiono: received: " + s + "\n");
  }
}

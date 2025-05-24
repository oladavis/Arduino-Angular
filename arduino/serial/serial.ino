#include <string.h>
//---------------------------------------

void setup()
{
  Serial.begin(9600);
}
int i = 0;
int incomingByte = 0; // for incoming serial data
const int frameSize = 6;
String frames[frameSize] = {".", "..", "...", "..", ".", ""};

void loop()
{

  Serial.println("Arduiono: (" + String(i++) + "): Listening for commands" +
                 frames[i % frameSize]);
  if (Serial.available() > 0)
  {
    String s = Serial.readString();
    Serial.print("I received: " + s + "\n");

    // Returns first token
    char *token = strtok((char *)s.c_str(), ",");

    // Keep printing tokens while one of the
    // delimiters present in str[].
    while (token != NULL)
    {
      Serial.print("token: " + String(token) + "\n");
      token = strtok(NULL, ",");
    }
  }
   delay(1000);
}

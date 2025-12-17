// =====================
// Includes
// =====================
#include <ModbusMaster.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <HTTPClient.h>


// =====================
// Global Variables
// =====================
ModbusMaster co2Sensor; 
ModbusMaster relaySlaveDevice;
ModbusMaster humidTempSensor;
ModbusMaster soilSensor;
ModbusMaster lightSensor;

// WiFi credentials - replace placeholders with your network credentials
const char* ssid = "manara";       // <<-- replace with your WiFi SSID
const char* password = "M@12344321"; // <<-- replace with your WiFi password

// Backend server base URLs - replace placeholders with your backend IP(s)
const char* serverBase = "http://192.168.68.100:3001";
const char* serverBaseAlt = "http://192.168.68.100:3001";

const char* deviceId = "basin-04";
unsigned long lastTelemetry = 0;
unsigned long lastPoll = 0;

// Promote sensor variables to file-scope so sendTelemetry() can include them in the JSON payload
bool pumpIsOn = false;
uint16_t co2Level = 0;
uint16_t airTemp = 0, humidity = 0;
uint16_t soilTemp = 0, soilMoisture = 0, soilEC = 0, soilPH = 0, soilN = 0, soilP = 0, soilK = 0;
uint16_t low, lux = 0;
uint8_t result;


// =====================
// Setup
// =====================
void setup() {
  Serial.begin (115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  Serial1.begin(9600, SERIAL_8N1 , 17, 18);
  co2Sensor.begin(1, Serial1);
  relaySlaveDevice.begin(2, Serial1);
  humidTempSensor.begin(6, Serial1);
  soilSensor.begin(4, Serial1);
  lightSensor.begin(5, Serial1);

  delay(5000);

}


// =====================
// Loop
// =====================
void loop() {
  unsigned long now = millis();
  
  // Read sensors first so telemetry carries real values
  readSensors();

  if (now - lastTelemetry > 5000) { // send telemetry every 10s
    sendTelemetry();
    lastTelemetry = now;
  }
  if (now - lastPoll > 5000) { // poll commands every 5s
    pollCommands();
    lastPoll = now;
  }

  pumpSwitch(1, pumpIsOn);
  // printSensorSerial();

  // keep serial updates readable
  delay(1000);
}


// =====================
// Helper Functions
// =====================

void printSensorSerial() {
  Serial.print("\n CO2: "); Serial.print(co2Level);
  Serial.print("\n Temperature: "); Serial.print(airTemp);
  Serial.print("\n Humidity: "); Serial.print(humidity);
  Serial.print("\n Soil Temp: "); Serial.print(soilTemp);
  Serial.print("\n Soil Moisture: "); Serial.print(soilMoisture);
  Serial.print("\n Soil EC: "); Serial.print(soilEC);
  Serial.print("\n Soil pH: "); Serial.print(soilPH);
  Serial.print("\n Soil N: "); Serial.print(soilN);
  Serial.print("\n Soil P: "); Serial.print(soilP);
  Serial.print("\n Soil K: "); Serial.print(soilK);
  Serial.print("\n Lumens: "); Serial.print(lux);
  Serial.print("\n");

}

void readSensors() {
  // CO2 level
  co2Sensor.readHoldingRegisters(0x0005, 1);
  co2Level = co2Sensor.getResponseBuffer(0);
  delay(1000);

  // temperature & humidity
  humidTempSensor.readHoldingRegisters(0x0000, 2);
  humidity = humidTempSensor.getResponseBuffer(0) / 10;
  airTemp = humidTempSensor.getResponseBuffer(1) / 10;
  delay(5000);

  result = soilSensor.readHoldingRegisters(0x0000, 7);
  Serial.println(result, HEX);
  soilTemp = soilSensor.getResponseBuffer(0) / 10;
  soilMoisture = soilSensor.getResponseBuffer(1) / 10;
  soilEC = soilSensor.getResponseBuffer(2);
  soilPH = soilSensor.getResponseBuffer(3) / 100.0;
  soilN = soilSensor.getResponseBuffer(4);
  soilP = soilSensor.getResponseBuffer(5);
  soilK = soilSensor.getResponseBuffer(6);
  delay(2000);


  lightSensor.readHoldingRegisters(0x07, 2);
  lux =  lightSensor.getResponseBuffer(0);
  result = lightSensor.getResponseBuffer(1);
  delay(1000);

}


void pumpSwitch(uint8_t relayNum, bool switchedOn) {
}


// =====================
// Telemetry Functions
// =====================

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("sendTelemetry: WiFi not connected");
    return;
  }

  String url = String(serverBase) + "/telemetry"; // <<-- make sure we post to /telemetry
  String urlAlt = String(serverBaseAlt) + "/telemetry"; // <<-- make sure we post to /telemetry


  // enlarge JSON doc to fit all readings
  StaticJsonDocument<512> doc;
  doc["deviceId"] = deviceId;
  JsonObject readings = doc.createNestedObject("readings");

  // Populate readings with the globals updated in loop()
  readings["co2Level"] = co2Level;
  readings["airTemp"] = airTemp;
  readings["humidity"] = humidity;
  readings["soilTemp"] = soilTemp;
  readings["soilMoisture"] = soilMoisture;
  readings["soilEC"] = soilEC;
  readings["soilPH"] = soilPH;
  readings["soilN"] = soilN;
  readings["soilP"] = soilP;
  readings["soilK"] = soilK;
  readings["lux"] = lux;


  String payload;
  serializeJson(doc, payload);

  Serial.print("POST -> ");
  Serial.println(url);
  Serial.print("Payload: ");
  Serial.println(payload);

  HTTPClient http;
  HTTPClient httpAlt;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int code = http.POST(payload);
  Serial.print("HTTP result code: ");
  Serial.println(code);

  if (code > 0) {
    String resp = http.getString();
    Serial.print("Server response: ");
    Serial.println(resp);
  } else {
    Serial.print("HTTP error: ");
    Serial.println(http.errorToString(code));
  }

  http.end();


  httpAlt.begin(urlAlt);
  httpAlt.addHeader("Content-Type", "application/json");

  int codeAlt = httpAlt.POST(payload);
  Serial.print("HTTP result code: ");
  Serial.println(codeAlt);

  if (codeAlt > 0) {
    String respAlt = httpAlt.getString();
    Serial.print("Server response: ");
    Serial.println(respAlt);
  } else {
    Serial.print("HTTP error: ");
    Serial.println(httpAlt.errorToString(codeAlt));
  }

  httpAlt.end();

}


// =====================
// Command Handler Functions
// =====================

void pollCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  String url = String(serverBase) + "/command/" + deviceId;
  http.begin(url);
  int code = http.GET();
  if (code == HTTP_CODE_OK) {
    String body = http.getString();
    StaticJsonDocument<200> doc;
    DeserializationError err = deserializeJson(doc, body);
    if (!err) {
      if (doc.containsKey("commands") && doc["commands"].containsKey("pump")) {
        pumpIsOn = doc["commands"]["pump"];
      } else {
        Serial.println("error while deserializing GET request");
      }
      // apply command to hardware here
    }
  }
  http.end();
}

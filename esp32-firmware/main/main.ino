void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;
  StaticJsonDocument<512> doc;
  doc["deviceId"] = deviceId;
  doc["co2"] = co2Level;
  doc["airTemp"] = airTemp;
  doc["humidity"] = humidity;
  doc["soilTemp"] = soilTemp;
  doc["soilMoisture"] = soilMoisture;
  doc["soilEC"] = soilEC;
  doc["soilPH"] = soilPH;
  doc["soilN"] = soilN;
  doc["soilP"] = soilP;
  doc["soilK"] = soilK;
  doc["lux"] = lux;
  doc["pumpIsOn"] = pumpIsOn;
  String json;
  serializeJson(doc, json);

  HTTPClient http;
  String url = String(serverBase) + "/api/sensors/data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(json);
  http.end();
}
// =====================
// Includes
// =====================
#include <ModbusMaster.h>
#include <ArduinoJson.h>
#include <WiFi.h>

#include <WebServer.h>
#include <HTTPClient.h>
// HTTP server on port 80
WebServer server(80);


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

  // HTTP GET /sensors returns sensor readings as JSON
  server.on("/sensors", HTTP_GET, []() {
    StaticJsonDocument<512> doc;
    doc["co2"] = co2Level;
    doc["airTemp"] = airTemp;
    doc["humidity"] = humidity;
    doc["soilTemp"] = soilTemp;
    doc["soilMoisture"] = soilMoisture;
    doc["soilEC"] = soilEC;
    doc["soilPH"] = soilPH;
    doc["soilN"] = soilN;
    doc["soilP"] = soilP;
    doc["soilK"] = soilK;
    doc["lux"] = lux;
    String json;
    serializeJson(doc, json);
    server.send(200, "application/json", json);
  });

  // HTTP POST /pump to control pump (expects JSON: {"on":true/false})
  server.on("/pump", HTTP_POST, []() {
    if (server.hasArg("plain")) {
      StaticJsonDocument<128> doc;
      DeserializationError err = deserializeJson(doc, server.arg("plain"));
      if (!err && doc.containsKey("on")) {
        pumpIsOn = doc["on"];
        server.send(200, "application/json", "{\"status\":\"ok\"}");
        return;
      }
    }
    server.send(400, "application/json", "{\"error\":\"Invalid payload\"}");
  });

  server.begin();

}


// =====================
// Loop
// =====================
void loop() {
  unsigned long now = millis();

  // Handle HTTP requests
  server.handleClient();

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
  delay(1000);


  // Soil sensor composite reads
  // soilSensor.readHoldingRegisters(0x00, 1);
  // soilTemp = soilSensor.getResponseBuffer(0);

  // soilSensor.readHoldingRegisters(0x64, 1);
  // soilMoisture = soilSensor.getResponseBuffer(0);
  // soilSensor.readHoldingRegisters(0x01, 1);
  // soilMoisture += (soilSensor.getResponseBuffer(0) << 8);

  // soilSensor.readHoldingRegisters(0xD2, 1);
  // soilEC = soilSensor.getResponseBuffer(0);
  // soilSensor.readHoldingRegisters(0x04, 1);
  // soilEC += (soilSensor.getResponseBuffer(0) << 8);

  // soilSensor.readHoldingRegisters(0xAE, 1);
  // soilPH = soilSensor.getResponseBuffer(0);
  // soilSensor.readHoldingRegisters(0x02, 1);
  // soilPH += (soilSensor.getResponseBuffer(0) << 8);
  
  // soilSensor.readHoldingRegisters(0x87, 1);
  // soilN = soilSensor.getResponseBuffer(0);

  // soilSensor.readHoldingRegisters(0x8A, 1);
  // soilP = soilSensor.getResponseBuffer(0);

  // soilSensor.readHoldingRegisters(0x8E, 1);
  // soilK = soilSensor.getResponseBuffer(0);

  lightSensor.readHoldingRegisters(0x08, 1);
  lux =  lightSensor.getResponseBuffer(0);
  delay(1000);

}


void pumpSwitch(uint8_t relayNum, bool switchedOn) {
}


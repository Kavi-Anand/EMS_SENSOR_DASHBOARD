#include <Wire.h>
#include <DHT.h>
#include <Adafruit_BMP085.h>

// DHT11 wiring: VCC -> 5V, DATA -> D2, GND -> GND
#define DHT_PIN 2
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_BMP085 bmp;

const unsigned long SAMPLE_INTERVAL_MS = 2000;
unsigned long lastSample = 0;
bool bmpReady = false;

void setup() {
  Serial.begin(9600);
  dht.begin();
  Wire.begin();

  bmpReady = bmp.begin();
  // Send status to USB Serial; collector ignores non-data lines.
  if (!bmpReady) {
    Serial.println("#ERROR: BMP180/BMP085 not detected. Check I2C wiring and library.");
  } else {
    Serial.println("#READY");
  }
}

void loop() {
  if (millis() - lastSample < SAMPLE_INTERVAL_MS) return;
  lastSample = millis();

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("#ERROR: DHT11 read failed.");
    return;
  }

  if (!bmpReady) {
    Serial.println("#ERROR: BMP180 unavailable; no complete sample sent.");
    return;
  }

  // BMP pressure is returned in Pa; convert to hPa.
  float pressureHpa = bmp.readPressure() / 100.0;

  // CSV protocol: temperature_C,humidity_percent,pressure_hPa
  Serial.print(temperature, 1);
  Serial.print(",");
  Serial.print(humidity, 1);
  Serial.print(",");
  Serial.println(pressureHpa, 1);
}

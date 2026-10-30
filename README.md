# Environmental Monitoring System (EMS)

A local, real-sensor monitoring dashboard using Arduino UNO, DHT11 and BMP180/BMP085.

## Data flow

`DHT11 + BMP180 -> Arduino UNO -> USB Serial -> Python collector -> Flask API -> React/Vite dashboard`

**No random or simulated readings are generated.** The dashboard displays `--` until a valid physical sensor sample reaches the backend.

## Hardware wiring

### DHT11 module -> Arduino UNO
| DHT11 | Arduino UNO |
|---|---|
| VCC | 5V |
| DATA | D2 |
| GND | GND |

For a bare 4-pin DHT11, add a 10 kΩ pull-up resistor between DATA and VCC. A 3-pin breakout module normally includes it.

### BMP180/BMP085 -> Arduino UNO (I2C)
| BMP180 | Arduino UNO |
|---|---|
| SDA | A4 |
| SCL | A5 |
| GND | GND |
| VCC | Follow the breakout board specification |

Important: a bare BMP180 chip is a 3.3 V device. Some breakout boards include a regulator/level shifting and accept 5 V VIN; others do not. Check the exact board markings/datasheet before powering it. Do not assume every BMP180 module is 5 V tolerant.

## Software prerequisites

- Arduino IDE
- Python 3.10+
- Node.js LTS
- VS Code (optional)

## 1. Arduino setup

Install these libraries from Arduino IDE > Library Manager:
- `DHT sensor library` by Adafruit
- `Adafruit Unified Sensor` (dependency of the DHT library)
- `Adafruit BMP085 Library` by Adafruit (supports BMP180/BMP085)

Open `arduino/ems_sensors.ino`, select **Arduino Uno** and the correct COM port, then upload. The sketch sends one CSV line every 2 seconds:

`temperature_C,humidity_percent,pressure_hPa`

Open Serial Monitor at 9600 baud to verify readings, then **close Serial Monitor** before starting the Python collector (only one program can own the COM port at a time).

## 2. Backend setup (Terminal 1)

From the project root:

```powershell
cd backend
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python server.py
```

Backend: http://127.0.0.1:5000  
Health check: http://127.0.0.1:5000/api/health  
Latest reading: http://127.0.0.1:5000/api/latest

The API returns `data: null` until the first real sensor reading arrives. Readings/history are held in memory and reset when the backend restarts.

## 3. Collector setup (Terminal 2)

Open a second terminal at the project root:

```powershell
cd collector
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
```

Set your actual Arduino COM port (example COM5):

```powershell
$env:EMS_SERIAL_PORT="COM5"
python collector.py
```

The collector prints detected serial ports at startup. Change `COM5` to the port shown in Windows Device Manager > Ports (COM & LPT). Keep Arduino Serial Monitor closed.

## 4. Frontend setup (Terminal 3)

From the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Run order

1. Upload Arduino sketch.
2. Start backend.
3. Start collector.
4. Start frontend.

Keep all three terminals running. The dashboard polls the API every 2 seconds.

## Troubleshooting

- **COM port busy:** close Arduino Serial Monitor and Serial Plotter.
- **Could not open COMx:** check Device Manager and set `EMS_SERIAL_PORT` to the correct port.
- **BMP not detected:** check SDA=A4, SCL=A5, common GND, power requirements, and that the board is actually BMP180/BMP085-compatible.
- **DHT read failed:** check DHT pin order, DATA on D2, and pull-up resistor if using a bare sensor.
- **Dashboard says backend offline:** ensure Flask is running on port 5000.
- **No reading yet:** check Serial Monitor first, close it, then run collector.

## GitHub

Do not commit `.venv/`, `node_modules/`, `__pycache__/`, or `.env` files. A `.gitignore` is included.

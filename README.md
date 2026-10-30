# Environmental Monitoring System (EMS)

## 1. Project Overview

The Environmental Monitoring System (EMS) is an IoT-based real-time environmental monitoring application that collects data from physical sensors and displays the measurements through a web-based dashboard.

The system uses an Arduino UNO connected to a DHT11 temperature and humidity sensor and a BMP180 atmospheric pressure sensor. The collected readings are transmitted to a Python application through serial communication. A Flask backend processes the readings and provides REST APIs, while a React-based dashboard displays the sensor measurements and their trends.

**The system uses actual hardware sensor readings. It does not generate random or simulated sensor values.**

## 2. Objectives

- Monitor environmental temperature in real time.
- Measure relative humidity.
- Monitor atmospheric pressure.
- Collect sensor readings using Arduino UNO.
- Transfer sensor data through serial communication.
- Process and expose readings through Flask REST APIs.
- Display live measurements through a React dashboard.
- Visualize recent sensor readings using trend graphs.

## 3. Technologies Used

| Component | Technology |
|---|---|
| Microcontroller | Arduino UNO |
| Temperature and Humidity Sensor | DHT11 |
| Pressure Sensor | BMP180 |
| Hardware Programming | Arduino C/C++ |
| Data Collection | Python |
| Backend | Flask |
| Frontend | React.js |
| Frontend Build Tool | Vite |
| Data Communication | Serial Communication and REST API |
| Styling | CSS |
| Version Control | Git and GitHub |

## 4. System Architecture

The project follows a layered architecture:

1. **Sensor Layer:** DHT11 measures temperature and humidity, while BMP180 measures atmospheric pressure.
2. **Microcontroller Layer:** Arduino UNO reads sensor measurements and transmits them through USB serial communication.
3. **Data Collection Layer:** Python reads the serial data, validates the measurements, and sends them to the backend as JSON.
4. **Backend Layer:** Flask receives the readings and maintains the latest measurements and recent history in memory.
5. **Frontend Layer:** React retrieves readings through REST APIs and displays them on the dashboard.

### Data Flow

Physical Sensors → Arduino UNO → Python Collector → Flask Backend → REST API → React Dashboard

## 5. Hardware Requirements

- Arduino UNO
- DHT11 temperature and humidity sensor
- BMP180 pressure sensor
- Breadboard
- Jumper wires
- USB cable
- Computer or laptop

### Hardware Connections

**DHT11 Sensor**

| DHT11 Pin | Arduino UNO |
|---|---|
| VCC | 5V |
| DATA | Digital Pin 2 |
| GND | GND |

**BMP180 Sensor**

| BMP180 Pin | Arduino UNO |
|---|---|
| SDA | A4 |
| SCL | A5 |
| GND | GND |
| VCC | According to the breakout board specifications |

**Note:** A bare BMP180 sensor requires 3.3V. Check the specifications of your breakout board before connecting it to 5V.

## 6. Project Folder Structure

```text
EMS_SENSOR_DASHBOARD/
│
├── arduino/
│   └── ems_sensors.ino
│
├── collector/
│   ├── collector.py
│   └── requirements.txt
│
├── backend/
│   ├── server.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── vite-env.d.ts
│   │   └── services/
│   │       └── api.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

## 7. Software Requirements

Install the following software before running the project:

- Arduino IDE
- Python 3
- Node.js and npm
- Visual Studio Code
- Git

### Arduino Libraries

Install these libraries through Arduino IDE Library Manager:

- DHT sensor library by Adafruit
- Adafruit Unified Sensor
- Adafruit BMP085 Library

## 8. Installation and Execution

Run the components in the following order.

### Step 1: Configure Arduino

1. Connect the DHT11 and BMP180 sensors to Arduino UNO.
2. Open `arduino/ems_sensors.ino` in Arduino IDE.
3. Install the required libraries.
4. Select the correct Arduino board and COM port.
5. Upload the program.
6. Ensure the sensors are connected correctly.

The Arduino sends sensor measurements through serial communication at 9600 baud.

Example serial output:

```text
28.5,65.0,1008.2
```

The values represent temperature (°C), humidity (%) and pressure (hPa).

### Step 2: Start the Flask Backend

Open a terminal in the project root directory.

```powershell
cd backend
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python server.py
```

The backend runs at:

`http://127.0.0.1:5000`

### Step 3: Start the Python Collector

Open a second terminal.

```powershell
cd collector
py -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
```

Set the Arduino COM port. Replace COM5 with the actual port shown in Arduino IDE.

```powershell
$env:EMS_SERIAL_PORT="COM5"
python collector.py
```

The collector reads sensor measurements and sends them to the Flask backend.

**Important:** Close Arduino IDE Serial Monitor before starting the Python collector because both applications cannot normally use the same serial port simultaneously.

### Step 4: Start the React Frontend

Open a third terminal.

```powershell
cd frontend
npm install
npm run dev
```

Open the following address in your browser:

`http://localhost:5173`

## 9. Backend API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| POST | `/api/update` | Receives sensor readings |
| GET | `/api/latest` | Returns the latest sensor readings |
| GET | `/api/history` | Returns recent sensor history |
| GET | `/api/health` | Checks backend availability |

### Example Sensor Data

```json
{
  "temperature": 28.5,
  "humidity": 65.0,
  "pressure": 1008.2
}
```

## 10. Dashboard Features

- Real-time temperature monitoring.
- Live humidity monitoring.
- Atmospheric pressure monitoring.
- Sensor connection and data availability status.
- Last updated timestamp.
- Recent sensor trend visualization.
- Automatic dashboard refresh every two seconds.

The dashboard displays unavailable values when actual sensor readings have not yet reached the backend.

## 11. Data Storage

The current implementation maintains the latest sensor readings and up to 300 recent history samples in the Flask backend's memory.

The current version does not use a persistent database. Consequently, the stored readings are cleared when the backend restarts.

A future enhancement can integrate SQLite to permanently store timestamped sensor readings and support long-term historical analysis.

## 12. Expected Output

After successful hardware connection and execution:

1. Arduino reads the physical sensor measurements.
2. Python collects and validates the readings.
3. Flask receives and processes the data.
4. React fetches the latest readings.
5. The dashboard displays temperature, humidity and pressure.
6. Trend graphs update as new measurements arrive.

## 13. Future Enhancements

- Integrate SQLite for permanent sensor-data storage.
- Add historical data analysis and date-based filtering.
- Introduce configurable environmental threshold monitoring.
- Add email or notification-based alerts.
- Support multiple sensor locations.
- Deploy the dashboard and backend to a cloud platform.

## 14. Conclusion

The Environmental Monitoring System demonstrates the integration of IoT hardware, Python-based data collection, Flask backend development and React frontend technologies.

By collecting actual environmental measurements from physical sensors and presenting them through a web-based dashboard, the system provides a practical approach to real-time environmental monitoring. The modular architecture also allows future improvements such as permanent database storage, historical analysis and advanced monitoring features.

---

**Project:** Environmental Monitoring System (EMS)  
**Category:** Internet of Things (IoT)  
**Architecture:** Arduino + Python + Flask + React  
**Data Source:** Physical DHT11 and BMP180 sensors

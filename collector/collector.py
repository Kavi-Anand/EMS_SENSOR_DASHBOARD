import os
import time
import requests
import serial
from serial.tools import list_ports

SERIAL_PORT = os.getenv("EMS_SERIAL_PORT", "COM5")  # Change to your Arduino port
BAUD_RATE = int(os.getenv("EMS_BAUD_RATE", "9600"))
BACKEND_URL = os.getenv("EMS_BACKEND_URL", "http://127.0.0.1:5000/api/update")

def show_ports():
    ports = list(list_ports.comports())
    if ports:
        print("Detected serial ports:")
        for port in ports:
            print(f"  {port.device}: {port.description}")
    else:
        print("No serial ports detected. Check USB cable/Arduino driver.")

def main():
    show_ports()
    print(f"Connecting to Arduino on {SERIAL_PORT} at {BAUD_RATE} baud...")
    try:
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=3) as ser:
            # Arduino resets when the serial port opens; allow it to boot.
            time.sleep(2)
            print("Collector connected. Waiting for real sensor samples (Ctrl+C to stop).")
            while True:
                raw = ser.readline().decode("utf-8", errors="replace").strip()
                if not raw:
                    continue
                if raw.startswith("#"):
                    print(raw)
                    continue

                parts = raw.split(",")
                if len(parts) != 3:
                    print(f"Ignoring malformed serial line: {raw!r}")
                    continue

                try:
                    temperature, humidity, pressure = map(float, parts)
                except ValueError:
                    print(f"Ignoring non-numeric serial line: {raw!r}")
                    continue

                # Basic sanity checks prevent obvious wiring/read errors entering the API.
                if not (-40 <= temperature <= 80 and 0 <= humidity <= 100 and 300 <= pressure <= 1200):
                    print(f"Ignoring out-of-range sample: {raw}")
                    continue

                payload = {
                    "temperature": temperature,
                    "humidity": humidity,
                    "pressure": pressure,
                    "timestamp": time.time()
                }
                try:
                    response = requests.post(BACKEND_URL, json=payload, timeout=5)
                    response.raise_for_status()
                    print(
                        f"Uploaded | Temp: {temperature:.1f} °C | "
                        f"Humidity: {humidity:.1f}% | Pressure: {pressure:.1f} hPa"
                    )
                except requests.RequestException as exc:
                    print(f"Backend upload failed: {exc}")

    except serial.SerialException as exc:
        print(f"Could not open {SERIAL_PORT}: {exc}")
        print("Close Arduino Serial Monitor/Plotter, verify the COM port, then retry.")
    except KeyboardInterrupt:
        print("\\nCollector stopped.")

if __name__ == "__main__":
    main()

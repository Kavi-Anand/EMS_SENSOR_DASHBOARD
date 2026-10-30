from collections import deque
from datetime import datetime, timezone
from threading import Lock

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

lock = Lock()
latest_reading = None
history = deque(maxlen=300)

@app.get("/")
def home():
    return jsonify({
        "name": "EMS Sensor API",
        "status": "online",
        "endpoints": ["/api/health", "/api/latest", "/api/history", "/api/update"]
    })

@app.get("/api/health")
def health():
    return jsonify({"status": "online"})

@app.post("/api/update")
def update_reading():
    global latest_reading
    data = request.get_json(silent=True) or {}

    required = ("temperature", "humidity", "pressure")
    try:
        reading = {key: float(data[key]) for key in required}
    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Expected numeric temperature, humidity and pressure"}), 400

    if not (-40 <= reading["temperature"] <= 80):
        return jsonify({"error": "Temperature out of valid range"}), 400
    if not (0 <= reading["humidity"] <= 100):
        return jsonify({"error": "Humidity out of valid range"}), 400
    if not (300 <= reading["pressure"] <= 1200):
        return jsonify({"error": "Pressure out of valid range (hPa)"}), 400

    timestamp = data.get("timestamp")
    reading["timestamp"] = float(timestamp) if timestamp is not None else datetime.now(timezone.utc).timestamp()

    with lock:
        latest_reading = reading
        history.append(reading.copy())

    return jsonify({"status": "accepted", "reading": reading}), 200

@app.get("/api/latest")
def latest():
    with lock:
        if latest_reading is None:
            return jsonify({"status": "waiting_for_sensor", "data": None})
        return jsonify({"status": "ok", "data": latest_reading})

@app.get("/api/history")
def get_history():
    with lock:
        return jsonify(list(history))

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)

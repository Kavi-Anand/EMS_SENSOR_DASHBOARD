import { useEffect, useState } from "react";
import { getLatest, getHistory, type Reading } from "./services/api";

function Metric({ title, value, unit, icon, tone }: {
  title: string; value: string; unit: string; icon: string; tone: string;
}) {
  return <article className="metric-card">
    <div className="metric-top"><span className={`metric-icon ${tone}`}>{icon}</span><span className="live-dot">LIVE</span></div>
    <p className="metric-label">{title}</p>
    <div className="metric-value">{value}<small>{unit}</small></div>
    <p className="metric-foot">Latest sensor reading</p>
  </article>;
}

function Trend({ readings }: { readings: Reading[] }) {
  const points = readings.slice(-40);
  if (points.length < 2) return <div className="empty-chart">Waiting for more real sensor readings to build the trend…</div>;
  const makePath = (key: "temperature" | "humidity" | "pressure") => {
    const values = points.map(p => p[key]);
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    return values.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (values.length - 1)) * 100} ${90 - ((v - min) / range) * 75}`).join(" ");
  };
  return <div className="chart-wrap"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Recent sensor trend">
    {[15, 40, 65, 90].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} className="gridline" />)}
    <path d={makePath("temperature")} className="line-temp" />
    <path d={makePath("humidity")} className="line-humidity" />
    <path d={makePath("pressure")} className="line-pressure" />
  </svg><div className="legend"><span className="temp-key">Temperature</span><span className="humidity-key">Humidity</span><span className="pressure-key">Pressure</span></div></div>;
}

export default function App() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [connection, setConnection] = useState("Connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const latest = await getLatest();
        const rows = await getHistory();
        if (!active) return;
        setReading(latest.data);
        setHistory(rows);
        setConnection(latest.data ? "Sensor connected" : "Waiting for sensor");
        setError("");
      } catch (e) {
        if (!active) return;
        setConnection("Backend offline");
        setError(e instanceof Error ? e.message : "Could not reach backend");
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const fmt = (n: number | undefined, digits = 1) => n === undefined ? "--" : n.toFixed(digits);
  const lastSeen = reading ? new Date(reading.timestamp * 1000).toLocaleTimeString() : "No reading received";

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">E</div><div><h1>ENVIRONMENTAL MONITORING SYSTEM</h1><p>Real-time cleanroom environmental telemetry</p></div></div>
      <div className="status"><span className={reading ? "status-light" : "status-light idle"} />{connection}</div>
    </header>
    <section className="intro"><div><p className="eyebrow">LIVE MONITORING / ROOM CR-01</p><h2>Environmental Overview</h2><p className="subtext">Live readings collected directly from Arduino sensors.</p></div><div className="updated">LAST UPDATE <strong>{lastSeen}</strong></div></section>
    {error && <div className="error-banner">Cannot reach EMS backend: {error}. Confirm that the backend is running on port 5000.</div>}
    <section className="metrics">
      <Metric title="Temperature" value={fmt(reading?.temperature)} unit="°C" icon="°" tone="blue" />
      <Metric title="Relative Humidity" value={fmt(reading?.humidity)} unit="%" icon="％" tone="teal" />
      <Metric title="Atmospheric Pressure" value={fmt(reading?.pressure)} unit="hPa" icon="↗" tone="violet" />
    </section>
    <section className="panel">
      <div className="panel-heading"><div><p className="eyebrow">HISTORICAL TELEMETRY</p><h3>Sensor trends</h3></div><span className="sample-count">{history.length} samples in memory</span></div>
      <Trend readings={history} />
      <p className="chart-note">Each new point comes from the physical DHT11 and BMP180/BMP085 sensors. The backend retains the latest 300 readings while it is running.</p>
    </section>
    <footer>EMS · Arduino UNO · DHT11 · BMP180 · Local network dashboard</footer>
  </main>;
}

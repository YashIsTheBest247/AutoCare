import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RiskBadge from "./RiskBadge.jsx";

const RISK_COLORS = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };

function center(vehicles) {
  if (!vehicles.length) return [28.6139, 77.209];
  const lat = vehicles.reduce((s, v) => s + v.latitude, 0) / vehicles.length;
  const lng = vehicles.reduce((s, v) => s + v.longitude, 0) / vehicles.length;
  return [lat, lng];
}

export default function FleetMap({ vehicles }) {
  const located = (vehicles || []).filter(
    (v) => typeof v.latitude === "number" && typeof v.longitude === "number"
  );

  if (!located.length) {
    return (
      <div className="h-[360px] flex items-center justify-center text-sm text-muted">
        No vehicle locations available yet.
      </div>
    );
  }

  return (
    <div className="h-[360px] rounded-xl overflow-hidden border border-line">
      <MapContainer center={center(located)} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {located.map((v) => {
          const color = RISK_COLORS[v.latest_risk_level] || "#2563eb";
          return (
            <CircleMarker
              key={v.id}
              center={[v.latitude, v.longitude]}
              radius={10}
              pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.95 }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <span className="font-semibold">{v.name}</span>
              </Tooltip>
              <Popup>
                <div className="space-y-1.5 min-w-[160px]">
                  <p className="font-bold text-ink">{v.name}</p>
                  <p className="text-xs text-muted">{v.model} · {v.type}</p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-muted">Health</span>
                    <span className="text-sm font-bold text-ink">{v.health_score}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">Risk</span>
                    <RiskBadge level={v.latest_risk_level} />
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

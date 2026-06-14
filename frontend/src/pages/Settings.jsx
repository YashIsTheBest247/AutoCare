import { useEffect, useState } from "react";
import {
  getThresholds, updateThresholds, resetThresholds,
  getAlertConfig, updateAlertConfig, getEmailStatus, sendTestEmail,
} from "../api/client.js";
import Select from "../components/Select.jsx";
import { Spinner, SectionTitle } from "../components/common.jsx";

const SENSOR_LABELS = {
  temperature: "Engine Temperature (°C)",
  battery_voltage: "Battery Voltage (V)",
  rpm: "Engine RPM",
  fuel_efficiency: "Fuel Efficiency (km/L)",
  vibration: "Vibration Level",
};

export default function Settings() {
  const [thresholds, setThresholds] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [testMsg, setTestMsg] = useState("");

  useEffect(() => {
    getThresholds().then(setThresholds);
    getAlertConfig().then(setAlerts);
    getEmailStatus().then((s) => setEmailConfigured(s.configured));
  }, []);

  const flash = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(""), 3000);
  };

  const setRange = (key, bound, value) =>
    setThresholds({ ...thresholds, [key]: { ...thresholds[key], [bound]: value } });

  const saveThresholds = async () => {
    const payload = Object.fromEntries(
      Object.entries(thresholds).map(([k, v]) => [k, { low: Number(v.low), high: Number(v.high) }])
    );
    const res = await updateThresholds(payload);
    setThresholds(res);
    flash(setSavedMsg, "Thresholds saved.");
  };

  const doReset = async () => setThresholds(await resetThresholds());

  const saveAlerts = async () => {
    const res = await updateAlertConfig(alerts);
    setAlerts(res);
    flash(setSavedMsg, "Alert settings saved.");
  };

  const test = async () => {
    const res = await sendTestEmail(alerts.recipient);
    flash(setTestMsg, res.sent ? "Test email sent!" : `Failed: ${res.reason}`);
  };

  if (!thresholds || !alerts) return <Spinner label="Loading settings..." />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <SectionTitle action={savedMsg && <span className="text-xs text-risk-low">{savedMsg}</span>}>
          Anomaly Thresholds
        </SectionTitle>
        <div className="space-y-4">
          {Object.keys(SENSOR_LABELS).map((key) => (
            <div key={key}>
              <label className="label">{SENSOR_LABELS[key]}</label>
              <div className="flex items-center gap-2">
                <input type="number" step="any" className="input" value={thresholds[key].low}
                  onChange={(e) => setRange(key, "low", e.target.value)} />
                <span className="text-xs text-muted">to</span>
                <input type="number" step="any" className="input" value={thresholds[key].high}
                  onChange={(e) => setRange(key, "high", e.target.value)} />
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button className="btn-primary flex-1" onClick={saveThresholds}>Save Thresholds</button>
            <button className="btn-pill" onClick={doReset}>Reset</button>
          </div>
        </div>
      </div>

      <div className="card p-6 h-fit">
        <SectionTitle>Email Alerts</SectionTitle>
        <div className="space-y-4">
          <div className={`panel p-3 text-xs ${emailConfigured ? "text-risk-low" : "text-risk-medium"}`}>
            {emailConfigured
              ? "SMTP is configured — alerts can be sent."
              : "SMTP not configured. Set SMTP_HOST and related env vars in backend/.env to enable sending."}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-brand" checked={alerts.email_enabled}
              onChange={(e) => setAlerts({ ...alerts, email_enabled: e.target.checked })} />
            <span className="text-sm text-ink">Send email on new high-risk readings</span>
          </label>
          <div>
            <label className="label">Recipient Email</label>
            <input className="input" type="email" placeholder="ops@fleet.com" value={alerts.recipient}
              onChange={(e) => setAlerts({ ...alerts, recipient: e.target.value })} />
          </div>
          <div>
            <label className="label">Minimum Risk Level</label>
            <Select value={alerts.min_level} onChange={(v) => setAlerts({ ...alerts, min_level: v })}
              options={["Low", "Medium", "High"].map((l) => ({ value: l, label: l }))} />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={saveAlerts}>Save Alerts</button>
            <button className="btn-pill" onClick={test} disabled={!alerts.recipient}>Send Test</button>
          </div>
          {testMsg && <p className="text-xs text-muted">{testMsg}</p>}
        </div>
      </div>
    </div>
  );
}

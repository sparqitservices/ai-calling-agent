"use client";
import { useEffect, useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  async function save() {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    alert("Saved");
  }

  if (!settings) return <p>Loading…</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>Call Settings</h2>

      <label>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={e => setSettings({ ...settings, enabled: e.target.checked })}
        />
        Enable Calling
      </label>

      <br />

      <label>
        Call Interval (hours):
        <input
          type="number"
          value={settings.intervalHours}
          onChange={e => setSettings({ ...settings, intervalHours: e.target.value })}
        />
      </label>

      <br />

      <textarea
        value={settings.greeting}
        onChange={e => setSettings({ ...settings, greeting: e.target.value })}
        rows={4}
        cols={50}
      />

      <br />
      <button onClick={save}>Save Settings</button>
    </div>
  );
}

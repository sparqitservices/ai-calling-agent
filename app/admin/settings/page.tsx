"use client";

import { useEffect, useState } from "react";

type Settings = {
  enabled: boolean;
  intervalHours: number;
  greeting: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings);
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);

    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    alert("Settings saved");
  }

  if (!settings) {
    return <p style={{ padding: 40 }}>Loading settings…</p>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <h1>Call Settings</h1>

      <label>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) =>
            setSettings({ ...settings, enabled: e.target.checked })
          }
        />{" "}
        Enable auto calls
      </label>

      <br /><br />

      <label>
        Interval (hours):
        <input
          type="number"
          min={1}
          value={settings.intervalHours}
          onChange={(e) =>
            setSettings({
              ...settings,
              intervalHours: Number(e.target.value),
            })
          }
          style={{ marginLeft: 10 }}
        />
      </label>

      <br /><br />

      <label>
        Greeting (Hindi / Hinglish):
        <textarea
          rows={4}
          value={settings.greeting}
          onChange={(e) =>
            setSettings({ ...settings, greeting: e.target.value })
          }
          style={{ width: "100%", marginTop: 6 }}
        />
      </label>

      <br /><br />

      <button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}

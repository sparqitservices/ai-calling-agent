"use client";

import { useEffect, useState } from "react";

type Recording = {
  sid: string;
  duration: string;
  createdAt: string;
  url: string;
};

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recordings")
      .then((res) => res.json())
      .then((data) => {
        setRecordings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p style={{ padding: 40 }}>Loading recordings…</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Call Recordings</h1>

      {recordings.length === 0 && <p>No recordings found.</p>}

      {recordings.map((rec) => (
        <div key={rec.sid} style={{ marginBottom: 30 }}>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(rec.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Duration:</strong> {rec.duration || "N/A"} sec
          </p>
          <audio controls src={rec.url}></audio>
        </div>
      ))}
    </div>
  );
}

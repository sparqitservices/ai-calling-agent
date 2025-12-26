"use client";
import { useEffect, useState } from "react";

export default function CallLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(setLogs);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Call History</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>To</th>
            <th>Status</th>
            <th>Duration (s)</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.sid}>
              <td>{log.to}</td>
              <td>{log.status}</td>
              <td>{log.duration || "-"}</td>
              <td>{new Date(log.startTime).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

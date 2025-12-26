export default function Dashboard() {
  return (
    <div style={{ padding: 40 }}>
      <h1>AI Calling Agent – Admin</h1>

      <ul>
        <li><a href="/admin/settings">Call Settings</a></li>
        <li><button onClick={() => fetch("/api/trigger-call", { method: "POST" })}>
          Trigger Test Call
        </button></li>
      </ul>
    </div>
  );
}

export async function fetchModelPrediction(mode = "auto") {
  const r = await fetch(`${import.meta.env.VITE_API_BASE}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ mode }),
  });
  if (!r.ok) {
    if (!r.ok) throw new Error(`API ${r.status}`);
  }
  return r.json();
}

export async function saveUpcoming(kind, picks) {
  const r = await fetch(`${import.meta.env.VITE_API_BASE}/predictions/upcoming/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ kind, picks }),
  });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}

export async function listUpcoming() {
  const r = await fetch(`${import.meta.env.VITE_API_BASE}/predictions/upcoming`, {
    headers: { "Accept": "application/json" },
  });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}
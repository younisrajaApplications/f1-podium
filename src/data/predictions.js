const KEY = "f1pp.predictions.v1";

// Shape we store:
// { [raceId]: { user: { podium, madeAt }, model: { podium, madeAt, version } } }

function loadAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

function saveAll(obj) { localStorage.setItem(KEY, JSON.stringify(obj)); }

// Normalise a podium to {1:{code,name},2:{...},3:{...}}
function normalisePodium(podium = {}) {
  const normOne = (v) => {
    if (!v) return null;
    if (typeof v === "string") return { code: v, name: v }; // old shape fallback
    // expect {code?, name?}
    const code = v.code || v.name || null;
    const name = v.name || v.code || null;
    return code || name ? { code, name } : null;
  };
  return {
    1: normOne(podium[1]),
    2: normOne(podium[2]),
    3: normOne(podium[3]),
  };
}

export function savePrediction({ raceId, source, podium, modelVersion }) {
  const all = loadAll();
  const entry = all[raceId] || {};
  const now = new Date().toISOString();
  const normalised = normalisePodium(podium);

  if (source === "user") {
    entry.user = { podium: normalised, madeAt: now };
  } else if (source === "model") {
    entry.model = { podium: normalised, madeAt: now, version: modelVersion || "v1" };
  }
  all[raceId] = entry;
  saveAll(all);
  return entry;
}

export function getPredictions(raceId) {
  const all = loadAll();
  return all[raceId] || { user: null, model: null };
}

export function clearPredictions(raceId) {
  const all = loadAll();
  delete all[raceId];
  saveAll(all);
}

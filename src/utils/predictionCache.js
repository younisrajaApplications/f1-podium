const key = (raceId, kind) => `f1pp:${raceId}:${kind}`;

/** Read one cached record for a race/kind. */
export function readCache(raceId, kind) {
  try {
    const raw = localStorage.getItem(key(raceId, kind));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Write one record to the cache (localStorage) */
export function writeCache(raceId, kind, record) {
    try {
        localStorage.setItem(key(raceId, kind), JSON.stringify(record));
    } catch {}
}

/** Remove one cached record. */
export function clearCache(raceId, kind) {
  try {
    localStorage.removeItem(key(raceId, kind));
  } catch {}
}

/** Prefer the newer record by timestamp. */
export function pickLatest(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  const ta = Date.parse(a.madeAt || a.savedAt || 0);
  const tb = Date.parse(b.madeAt || b.savedAt || 0);
  return (isFinite(tb) && tb > ta) ? b : a;
}
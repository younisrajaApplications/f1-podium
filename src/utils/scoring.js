// Rule: exact position+driver = 3 pts; driver anywhere else = 1 pt; otherwise 0.
export function scorePodium(pred, truth) {
  const norm = (p = {}) => ({
    1: (p?.[1]?.code || p?.[1]?.name) ?? null,
    2: (p?.[2]?.code || p?.[2]?.name) ?? null,
    3: (p?.[3]?.code || p?.[3]?.name) ?? null,
  });

  const a = norm(pred);
  const b = norm(truth);

  // Exact matches
  const exact = [1,2,3].reduce((acc, pos) => acc + (a[pos] && b[pos] && a[pos] === b[pos] ? 1 : 0), 0);

  // Any-position matches (but not already counted as exact)
  const setB = new Set([b[1], b[2], b[3]].filter(Boolean));
  let any = 0;
  [1,2,3].forEach((pos) => {
    if (!a[pos]) return;
    if (a[pos] === b[pos]) return; // already counted as exact
    if (setB.has(a[pos])) any += 1;
  });

  const scoreExact = exact * 3;
  const scoreAny = any;
  const total = scoreExact + scoreAny;

  return { exact, any, scoreExact, scoreAny, total };
}

// Convenience: similarity between two podiums (user vs model)
// Uses the same rule, treating "model" as the "truth", for now, for a fun H2H.
export function scoreSimilarity(userPicks, modelPicks) {
  return scorePodium(userPicks, modelPicks);
}

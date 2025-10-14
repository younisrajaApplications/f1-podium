const ERGAST_BASE = (import.meta.env && import.meta.env.VITE_ERGAST_BASE) || "https://ergast.com/api/f1";

async function getJSON(path) {
    const url = `${ERGAST_BASE}${path}`;
    const res = await fetch(url, { headers: {Accept: "application/json"}});
    
    // Ergast sometimes replies text/xml if you hit a .xml path by mistake
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(
            `Ergast returned non-JSON (content-type: ${contentType}). Check the path: ${url}\nFirst 120 chars:\n${text.slice(
                0,
                120
            )}…`
        );
    }

    if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

/**
 * Fetch current season driver standings and map to a roster:
 * [{ id, name, code, team }]
 * This gives each driver's current constructor (team) without N requests.
 */
export async function fetchCurrentRoster() {
  const data = await getJSON(`/current/driverStandings.json`);
  const lists = data?.MRData?.StandingsTable?.StandingsLists || [];
  const standings = lists[0]?.DriverStandings || [];

  const roster = standings.map((s) => {
    const d = s.Driver || {};
    const team = (s.Constructors && s.Constructors[0]?.name) || "";
    const code =
      d.code ||
      (d.familyName ? d.familyName.slice(0, 3).toUpperCase() : "").padEnd(
        3,
        "_"
      );

    return {
      id: (d.driverId || "").toLowerCase(),
      name: `${d.givenName || ""} ${d.familyName || ""}`.trim(),
      code,
      team,
    };
  });

  // Sort by points desc (just nicer ordering in the dropdowns)
  return roster;
}
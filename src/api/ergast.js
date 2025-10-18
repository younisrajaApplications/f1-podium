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

export async function fetchSeasons({ limit = 20 } = {}) {
  // 1) Get total seasons 
  const meta = await getJSON(`/seasons.json?limit=1&offset=0`);
  const total = Number(meta?.MRData?.total || 0);

  // 2) Start at the last page
  const start = Math.max(0, total - limit);

  // 3) Fetch just the last N seasons, then sort newest → oldest
  const data = await getJSON(`/seasons.json?limit=${limit}&offset=${start}`);
  const seasons = data?.MRData?.SeasonTable?.Seasons || [];
  return seasons.map(s => s.season).sort((a, b) => Number(b) - Number(a));
}

// Season schedule
export async function fetchSchedule(season) {
  const data = await getJSON(`/${season}.json`);
  const races = data?.MRData?.RaceTable?.Races || [];
  return races.map( r => ({
    round: r.round,
    raceName: r.raceName,
    circuit: r.Circuit?.circuitName || "",
    locality: r.Circuit?.Location?.locality || "",
    country: r.Circuit?.Location?.country || "",
    date: r.date,
  }));
}

// Race results for the season and round
export async function fetchRaceResult(season, round) {
  const data = await getJSON(`/${season}/${round}/results.json`);
  const race = data?.MRData?.RaceTable?.Races?.[0];
  const results = race?.Results || [];
  // Top 3
  const podium = results.slice(0, 3).map(r => ({
    name: `${r.Driver?.givenName || ""} ${r.Driver?.familyName || ""}`.trim(),
    code: r.Driver?.code || (r.Driver?.familyName || "___").slice(0, 3).toUpperCase(),
    position: r.position,
    constructor: r.Constructor?.name || "",
    time: r.Time?.time || r.status,
  }));
  // Top 10
  const top10 = results.slice(0, 10).map(r => ({
    pos: r.position,
    driver: `${r.Driver?.givenName || ""} ${r.Driver?.familyName || ""}`.trim(),
    code: r.Driver?.code || "",
    team: r.Constructor?.name || "",
    status: r.Time?.time || r.status,
    grid: r.grid,
  }));
  return {
    meta: {
      season,
      round,
      raceName: race?.raceName || "",
      circuit: race?.Circuit?.circuitName || "",
      date: race?.date || "",
      locality: race?.Circuit?.Location?.locality || "",
      country: race?.Circuit?.Location?.country || "",
    },
    podium,
    top10,
  };
}

// Function to get the upcoming race details
export async function fetchUpcomingRace() {
  const data = await getJSON(`/current/next.json`);
  const race = data?.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;

  const qualifiers = race.Qualifying || {};
  const toIso = (d, t) => {
    if (!d) return null;
    // If time is missing, assume noon UTC so it's comparable and displayable
    const hhmmss = t ? t : "12:00:00Z";
    return `${d}T${hhmmss}`.replace("Z", "Z");
  };

  return {
    raceId: `${race.season}-${race.round}`,     // e.g., "2025-17"
    season: Number(race.season),
    round: Number(race.round),
    name: race.raceName,
    country: race.Circuit?.Location?.country || "",
    locality: race.Circuit?.Location?.locality || "",
    raceStart: toIso(race.date, race.time),     // may be null if API omits time
    qualifiersStart: toIso(qualifiers.date, qualifiers.time),  // may be null
  };
}
export default function DriverPicker({
  label,                 // "Winner" | "P2" | "P3"
  options,               // [{id, name, code, team}]
  valueId,               // currently selected option id or ""
  onChange,              // (id) => void
  disabledIds = [],      // to prevent duplicates
}) {
  return (
    <div className="select-col">
      <div className="select-label">{label}</div>
      <select
        className="select"
        value={valueId || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select driver…</option>
        {options.map((d) => (
          <option key={d.id} value={d.id} disabled={disabledIds.includes(d.id)}>
            {d.name} {d.team ? `— ${d.team}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

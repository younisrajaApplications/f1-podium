import DriverPicker from "./DriverPicker";

/**
 * Props needed:
 * List of drivers, name, id, code, team
 * picks - state
 * setPicks - function to set state
 */

export default function DriverSelect({roster, picks, setPicks}) {
    //Disable the ids already chosen
    const chosen = [picks[1]?.id, picks[2]?.id, picks[3]?.id].filter(Boolean);

    const setPick = (place,id) => {
        const driver = roster.find((d) => d.id === id) || null;
        setPicks((prev) => ({...prev, [place]:driver}));
    }

    return (
        <>
            <div className="select-row">
                {/* Showing inputs in a visual podium order */}
                <DriverPicker 
                    label="P2" 
                    options={roster}
                    valueId={picks[2]?.id || ""}
                    disabledIds={chosen.filter((x) => x !== picks[2]?.id)}
                    onChange={(id) => setPick(2, id)}
                />
                <DriverPicker 
                    label="P1" 
                    options={roster}
                    valueId={picks[1]?.id || ""}
                    disabledIds={chosen.filter((x) => x !== picks[1]?.id)}
                    onChange={(id) => setPick(1, id)}
                />
                <DriverPicker 
                    label="P3" 
                    options={roster}
                    valueId={picks[3]?.id || ""}
                    disabledIds={chosen.filter((x) => x !== picks[3]?.id)}
                    onChange={(id) => setPick(3, id)}
                />
            </div>

            <div className="helper">
                Tip: a name disappears from the other dropdowns once chosen, so you cannot pick the same driver twice.
            </div>
        </>
    )
}
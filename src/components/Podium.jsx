import { useState } from "react";
import Placeholder from "./Placeholder";
import PodiumBlock from "./PodiumBlock";

/**
 * Podium
 * Needs to take in the top 3 driver names
 */

export default function Podium({picks}) {
    const [stage, setStage] = useState(0);
    // 0 = hidden, 1 = show 3rd place, 2 = show 2nd place and 3 = show first place

    const start = () => {
        setStage(1);
        setTimeout(() => setStage(2), 1100);
        setTimeout(() => setStage(3), 2200);
    };

    const reset = () => setStage(0);

    return (
        <div>
            <div className="controls">
                <button className="btn primary" onClick={start}>Show Podium</button>
                <button className="btn" onClick={reset}>Reset</button>
            </div>

            {/* Podium layout is 2|1|3 */}
            <div className="podium">
                {/* Second place reveal */}
                {stage >= 2 ? (
                    <PodiumBlock place={2} data={picks[2]} delay={0.15} />) : (<Placeholder heightClass="h2" />)
                }

                {/* First place reveal */}
                {stage >= 3 ? (
                    <PodiumBlock place={1} data={picks[1]} delay={0.3} />) : (<Placeholder heightClass="h1" />)
                }

                {/* Thrid place reveal */}
                {stage >= 1 ? (
                    <PodiumBlock place={3} data={picks[3]} delay={0.0} />) : (<Placeholder heightClass="h3" />)
                }        
            </div>

        </div>
    );
}
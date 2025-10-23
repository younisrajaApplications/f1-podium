import { useState } from "react";
import PodiumBlock from "./PodiumBlock";

/**
 * Podium
 * Needs to take in the top 3 driver names
 */

export default function Podium({picks, label, reveal, setReveal}) {
    const [stage, setStage] = useState(0);
    // 0 = hidden, 1 = show 3rd place, 2 = show 2nd place and 3 = show first place
    const [isRevealing, setIsRevealing] = useState(false);
    // For the podium

    const start = () => {
        if (isRevealing) return;
        setIsRevealing(true);
        setStage(1);
        setTimeout(() => setStage(2), 1100);
        setTimeout(() => {
            setStage(3);
            setTimeout(() => setIsRevealing(false), 200);
        }, 2200);
        setReveal(true);
    };

    const reset = () => {
        setStage(0);
        setIsRevealing(false);
        setReveal(false);
    }

    return (
        <div>
            <div className="controls">
                <button className="btn primary" onClick={start} disabled={isRevealing}>{reveal ? "Replay Reveal" : `${label}`}</button>
                <button className="btn" onClick={reset} disabled={stage === 0}>Reset</button>
            </div>

            {/* Podium layout is 2|1|3 */}
            {reveal &&
                <div className="podium">
                    {/* Second place reveal */}
                    {stage >= 2 && (
                        <PodiumBlock place={2} data={picks[2]} delay={0.15} />)
                    }

                    {/* First place reveal */}
                    {stage >= 3 && (
                        <PodiumBlock place={1} data={picks[1]} delay={0.3} />)
                    }

                    {/* Thrid place reveal */}
                    {stage >= 1 && (
                        <PodiumBlock place={3} data={picks[3]} delay={0.0} />)
                    }        
                </div>
            }
        </div>
    );
}
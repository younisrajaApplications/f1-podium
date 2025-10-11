import { motion } from "framer-motion";

export default function PodiumBlock({ place, data, delay = 0, highlight = false }) {
  const heights = { 1: "h1", 2: "h2", 3: "h3" };
  const labels = { 1: "1st", 2: "2nd", 3: "3rd" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="place">{labels[place]}</div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16, delay }}
        className={`block ${heights[place]}`}
        style={{ filter: highlight ? "saturate(1)" : "saturate(0.9)" }}
      >
        <div>
          <div className="name">{data?.name ?? "?"}</div>
          <div className="code">{data?.code ?? ""}</div>
        </div>
      </motion.div>
    </div>
  );
}

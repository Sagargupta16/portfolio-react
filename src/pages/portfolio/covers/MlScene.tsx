import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
  tint: string;
  variant?: string;
}

const HAIRLINE = "rgba(255,255,255,0.08)";

// viewBox 0 0 100 60, preserveAspectRatio none -- x/y map to % of chart area
const ACTUAL_D =
  "M 0 46 L 8 41 L 15 44 L 23 35 L 30 38 L 38 30 L 45 33 L 52 24 L 58 27";
const ACTUAL_AREA_D =
  "M 0 46 L 8 41 L 15 44 L 23 35 L 30 38 L 38 30 L 45 33 L 52 24 L 58 27 L 58 60 L 0 60 Z";
const PREDICTED_D = "M 58 27 L 66 21 L 73 24 L 81 15 L 89 18 L 100 9";

const TICKERS = ["AAPL", "MSFT", "TSLA"];

const CANDLES: { left: string; h: number[]; delay: number }[] = [
  { left: "8%", h: [10, 15, 10], delay: 0 },
  { left: "16%", h: [14, 9, 14], delay: 0.7 },
  { left: "24%", h: [8, 13, 8], delay: 1.4 },
  { left: "32%", h: [12, 16, 12], delay: 2.1 },
];

const MlScene = ({ tint }: CoverSceneProps) => (
  <div
    aria-hidden="true"
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
    }}
  >
    {/* tinted radial glow */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 72% 18%, ${tint}14, transparent 62%)`,
      }}
    />
    {/* subtle dot grid */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.06,
        backgroundImage: "radial-gradient(circle, #60a5fa 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />

    {/* LSTM chip, top-left */}
    <div
      style={{
        position: "absolute",
        top: "9%",
        left: "6%",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 7px",
        borderRadius: 5,
        border: `1px solid ${tint}35`,
        background: `${tint}0a`,
      }}
    >
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: tint,
          display: "block",
        }}
      />
      <span
        style={{
          fontFamily: MONO_FONT,
          fontSize: 7.5,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        LSTM
      </span>
    </div>

    {/* ticker labels cycling, top-right */}
    <div
      style={{
        position: "absolute",
        top: "10%",
        right: "6%",
        display: "flex",
        gap: 9,
      }}
    >
      {TICKERS.map((t, i) => (
        <motion.span
          key={t}
          animate={{ opacity: [0.25, 0.9, 0.25, 0.25] }}
          transition={{
            duration: 5.4,
            times: [0, 0.15, 0.33, 1],
            delay: i * 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            fontFamily: MONO_FONT,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#60a5fa",
          }}
        >
          {t}
        </motion.span>
      ))}
    </div>

    {/* chart area with hairline axes */}
    <div
      style={{
        position: "absolute",
        left: "12%",
        right: "9%",
        top: "26%",
        bottom: "22%",
        borderLeft: `1px solid ${HAIRLINE}`,
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      {/* faint horizontal gridlines */}
      {["33%", "66%"].map((top) => (
        <div
          key={top}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top,
            height: 1,
            background: "rgba(255,255,255,0.04)",
          }}
        />
      ))}

      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {/* soft fill under the actual line */}
        <path d={ACTUAL_AREA_D} fill="#60a5fa0a" />
        {/* actual price line */}
        <path
          d={ACTUAL_D}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* predicted track, static dashed */}
        <path
          d={PREDICTED_D}
          fill="none"
          stroke={`${tint}30`}
          strokeWidth={1}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
        {/* prediction drawing itself over the track, forever */}
        <motion.path
          d={PREDICTED_D}
          fill="none"
          stroke={tint}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
          transition={{
            duration: 4.2,
            times: [0, 0.6, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeInOut",
          }}
        />
      </svg>

      {/* live price dot at the actual/predicted junction (58, 27) */}
      <motion.div
        animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: "58%",
          top: "45%",
          width: 12,
          height: 12,
          marginLeft: -6,
          marginTop: -6,
          borderRadius: "50%",
          border: "1px solid #22c55e50",
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "58%",
          top: "45%",
          width: 5,
          height: 5,
          marginLeft: -2.5,
          marginTop: -2.5,
          borderRadius: "50%",
          background: "#22c55e",
        }}
      />

      {/* tiny candlestick bars along the bottom */}
      {CANDLES.map((c) => (
        <motion.div
          key={c.left}
          animate={{ height: c.h }}
          transition={{
            duration: 3.2,
            delay: c.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: c.left,
            bottom: 0,
            width: 3,
            borderRadius: 1,
            background: "#38bdf850",
          }}
        />
      ))}
    </div>
  </div>
);

export default MlScene;

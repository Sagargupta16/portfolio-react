import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
  tint: string;
  variant?: string;
}

/** Chip texts cycled next to the copy icon, per variant. */
const chipLabels = (variant?: string): string[] => {
  switch (variant) {
    case "recipes":
      return ["/code-review", "/refactor"];
    case "deploy":
      return ["VERCEL", "AWS", "PAGES"];
    case "skills":
      return ["/plugin add"];
    default:
      return ["COPIED"];
  }
};

const fileName = (variant?: string): string => {
  switch (variant) {
    case "recipes":
      return "RECIPES.MD";
    case "deploy":
      return "DEPLOY.YML";
    case "list":
      return "AWESOME.MD";
    case "skills":
      return "SKILL.MD";
    default:
      return "README.MD";
  }
};

const LINE_WIDTHS = ["74%", "56%", "82%", "44%"];

/** Docs / recipes / curated-lists cover scene -- fanned document stack + copy chip. */
const DocsScene = ({ tint, variant }: CoverSceneProps) => {
  const labels = chipLabels(variant);
  const cycle = Math.min(6, 2 + labels.length * 1.5);
  const seg = 1 / labels.length;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
      }}
    >
      {/* tinted glow + dot-grid depth layers */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 32% 24%, ${tint}14 0%, transparent 55%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* back cards of the fan */}
      <motion.div
        animate={{ rotate: [-7, -8.5, -7] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "17%",
          top: "24%",
          width: 112,
          height: 138,
          borderRadius: 8,
          border: "1px solid #60a5fa1c",
          background: "#60a5fa05",
          transformOrigin: "50% 95%",
        }}
      />
      <motion.div
        animate={{ rotate: [-3.5, -4.8, -3.5] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        style={{
          position: "absolute",
          left: "19%",
          top: "21.5%",
          width: 115,
          height: 142,
          borderRadius: 8,
          border: "1px solid #60a5fa26",
          background: "#0d161d",
          transformOrigin: "50% 95%",
        }}
      />

      {/* top document card: typed lines + check */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "21%",
          top: "19%",
          width: 118,
          height: 146,
          borderRadius: 8,
          border: "1px solid #60a5fa38",
          background: "#0e1a24",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 16,
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "0 7px",
            borderBottom: "1px solid #60a5fa18",
            background: "#60a5fa08",
          }}
        >
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#60a5fa50" }} />
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#38bdf830" }} />
          <span
            style={{
              marginLeft: "auto",
              fontFamily: MONO_FONT,
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: 0.6,
              color: "#60a5fa90",
            }}
          >
            {fileName(variant)}
          </span>
        </div>
        <div style={{ padding: "11px 9px", display: "flex", flexDirection: "column", gap: 8 }}>
          {LINE_WIDTHS.map((w, i) => (
            <motion.div
              key={w}
              animate={{ width: ["0%", w, w, "0%"] }}
              transition={{
                duration: 4.6,
                repeat: Infinity,
                delay: i * 0.35,
                times: [0, 0.22, 0.82, 1],
              }}
              style={{
                height: 2,
                borderRadius: 2,
                background: i === 0 ? `${tint}66` : "rgba(255,255,255,0.14)",
              }}
            />
          ))}
        </div>
        <motion.div
          animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.5, 0.5, 1, 1, 0.7] }}
          transition={{ duration: 4.6, repeat: Infinity, times: [0, 0.5, 0.62, 0.9, 1] }}
          style={{
            position: "absolute",
            right: 9,
            bottom: 9,
            width: 13,
            height: 13,
            borderRadius: "50%",
            border: "1px solid #22c55e50",
            background: "#22c55e10",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 3,
              top: 3.5,
              width: 5,
              height: 3,
              borderLeft: "1.5px solid #22c55e",
              borderBottom: "1.5px solid #22c55e",
              transform: "rotate(-45deg)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* star glyphs on the left edge, list variant only */}
      {variant === "list" &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.4] }}
            transition={{ duration: 3.8, repeat: Infinity, delay: i * 0.55, ease: "easeInOut", times: [0, 0.18, 0.78, 1] }}
            style={{
              position: "absolute",
              left: "10.5%",
              top: `${26 + i * 15}%`,
              fontFamily: MONO_FONT,
              fontSize: 10,
              lineHeight: 1,
              color: "#f59e0b",
              opacity: 0,
            }}
          >
            {"★"}
          </motion.span>
        ))}

      {/* connector hairline + traveling dot */}
      <div
        style={{
          position: "absolute",
          left: "47%",
          top: "34%",
          width: "14%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
        }}
      />
      <motion.div
        animate={{ x: [0, 58], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
        style={{
          position: "absolute",
          left: "47%",
          top: "34%",
          marginTop: -1.5,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#60a5fa",
        }}
      />

      {/* copy icon square */}
      <div
        style={{
          position: "absolute",
          left: "63%",
          top: "26%",
          width: 28,
          height: 28,
          borderRadius: 7,
          border: "1px solid #60a5fa30",
          background: "#60a5fa06",
        }}
      >
        <div style={{ position: "absolute", left: 7, top: 9, width: 9, height: 11, borderRadius: 2, border: "1px solid #60a5fa55" }} />
        <motion.div
          animate={{ x: [0, 2, 0], y: [0, -2, 0] }}
          transition={{ duration: cycle, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: 11,
            top: 6,
            width: 9,
            height: 11,
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.35)",
            background: "#0e1a24",
          }}
        />
      </div>

      {/* cycling chip below the copy icon */}
      <div style={{ position: "absolute", left: "58%", top: "42%", width: 96, height: 20 }}>
        {labels.map((text, i) => (
          <motion.span
            key={text}
            animate={{ opacity: [0, 1, 1, 0, 0], y: [3, 0, 0, 0, 0] }}
            transition={{
              duration: cycle,
              repeat: Infinity,
              delay: i * cycle * seg,
              times: [0, 0.06, seg * 0.75, Math.min(seg, 0.94), 1],
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "1px solid #38bdf830",
              background: "#38bdf80a",
              color: "#38bdf8",
              fontFamily: MONO_FONT,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 0.5,
              opacity: 0,
            }}
          >
            {text}
          </motion.span>
        ))}
      </div>

      {/* synced status */}
      <div style={{ position: "absolute", left: "60%", top: "64%", display: "flex", alignItems: "center", gap: 5 }}>
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "block" }}
        />
        <span
          style={{
            fontFamily: MONO_FONT,
            fontSize: 7,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          synced
        </span>
      </div>
    </div>
  );
};

export default DocsScene;

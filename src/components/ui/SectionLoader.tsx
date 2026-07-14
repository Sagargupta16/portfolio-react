import { CYAN } from "@/constants/theme";

const CONTAINER_STYLE: React.CSSProperties = {
   display: "flex",
   justifyContent: "center",
   alignItems: "center",
   minHeight: "30vh",
};

const SPINNER_STYLE: React.CSSProperties = {
   width: 32,
   height: 32,
   borderRadius: "50%",
   border: "2px solid rgba(96, 165, 250, 0.2)",
   borderTopColor: CYAN,
   animation: "spin 1s linear infinite",
};

const SectionLoader = () => (
   <div style={CONTAINER_STYLE} role="status" aria-label="Loading section">
      <div style={SPINNER_STYLE} />
   </div>
);

export default SectionLoader;

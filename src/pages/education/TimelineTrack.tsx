const TimelineTrack = () => (
   <div
      style={{
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         position: "relative",
      }}
   >
      <div
         style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid #a855f7",
            backgroundColor: "rgba(6, 6, 16, 0.6)",
            marginTop: 6,
            position: "relative",
            zIndex: 2,
            flexShrink: 0,
         }}
      >
         <div
            className="animate-glow-pulse"
            style={{
               position: "absolute",
               inset: 3,
               borderRadius: "50%",
               backgroundColor: "#a855f7",
            }}
         />
      </div>
      <div
         style={{
            width: 2,
            flex: 1,
            background:
               "linear-gradient(to bottom, rgba(168,85,247,0.4), rgba(168,85,247,0.1))",
            borderRadius: 1,
         }}
      />
   </div>
);

export default TimelineTrack;

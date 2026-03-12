interface ShapeRendererProps {
   type: string;
   size: number;
   color: string;
   rotation?: number;
}

const ShapeRenderer = ({
   type,
   size,
   color,
   rotation = 0,
}: ShapeRendererProps) => {
   if (type === "triangle") {
      return (
         <div
            style={{
               width: 0,
               height: 0,
               borderLeft: `${size / 2}px solid transparent`,
               borderRight: `${size / 2}px solid transparent`,
               borderBottom: `${size}px solid ${color}`,
               transform: `rotate(${rotation}deg)`,
            }}
         />
      );
   }

   if (type === "circle") {
      return (
         <div
            style={{
               width: size,
               height: size,
               borderRadius: "50%",
               background: color,
            }}
         />
      );
   }

   if (type === "ring") {
      return (
         <div
            style={{
               width: size,
               height: size,
               borderRadius: "50%",
               border: `1.5px solid ${color}`,
               background: "transparent",
            }}
         />
      );
   }

   if (type === "diamond") {
      return (
         <div
            style={{
               width: size,
               height: size,
               background: color,
               transform: `rotate(45deg)`,
            }}
         />
      );
   }

   return null;
};

export default ShapeRenderer;

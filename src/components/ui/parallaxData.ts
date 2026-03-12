export interface ParallaxElementShape {
   id: string;
   type: "triangle" | "circle" | "ring" | "diamond";
   top: string;
   left?: string;
   right?: string;
   size: number;
   color: string;
   speed: number;
   rotation?: number;
}

export const ELEMENTS: ParallaxElementShape[] = [
   // Triangles
   {
      id: "tri-tl",
      type: "triangle",
      top: "12%",
      left: "8%",
      size: 14,
      color: "rgba(6,182,212,0.12)",
      speed: -180,
      rotation: 15,
   },
   {
      id: "tri-br",
      type: "triangle",
      top: "65%",
      right: "6%",
      size: 18,
      color: "rgba(168,85,247,0.10)",
      speed: -250,
      rotation: -30,
   },
   // Circles
   {
      id: "cir-tr",
      type: "circle",
      top: "28%",
      right: "12%",
      size: 8,
      color: "rgba(6,182,212,0.15)",
      speed: -120,
   },
   {
      id: "cir-bl",
      type: "circle",
      top: "78%",
      left: "15%",
      size: 6,
      color: "rgba(236,72,153,0.12)",
      speed: -300,
   },
   // Rings
   {
      id: "ring-ml",
      type: "ring",
      top: "45%",
      left: "5%",
      size: 20,
      color: "rgba(168,85,247,0.08)",
      speed: -200,
   },
   {
      id: "ring-br",
      type: "ring",
      top: "88%",
      right: "10%",
      size: 16,
      color: "rgba(6,182,212,0.08)",
      speed: -350,
   },
   // Hexagons (diamond approximation)
   {
      id: "dia-mr",
      type: "diamond",
      top: "35%",
      right: "4%",
      size: 10,
      color: "rgba(34,197,94,0.10)",
      speed: -160,
   },
   {
      id: "dia-ml",
      type: "diamond",
      top: "55%",
      left: "10%",
      size: 12,
      color: "rgba(245,158,11,0.08)",
      speed: -280,
   },
];

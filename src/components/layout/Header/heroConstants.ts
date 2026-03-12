export const particlesOptions = {
   fullScreen: { enable: false },
   background: { color: { value: "transparent" } },
   fpsLimit: 60,
   particles: {
      color: { value: "#06b6d4" },
      move: {
         enable: true,
         speed: 0.3,
         direction: "none" as const,
         random: true,
         straight: false,
         outModes: { default: "out" as const },
      },
      number: {
         value: 60,
         density: { enable: true, area: 900 },
      },
      opacity: {
         value: { min: 0.1, max: 0.4 },
         animation: { enable: true, speed: 0.4, minimumValue: 0.1 },
      },
      shape: { type: "circle" },
      size: {
         value: { min: 0.5, max: 2.5 },
         animation: { enable: true, speed: 0.8, minimumValue: 0.5 },
      },
      links: { enable: false },
   },
   detectRetina: true,
   responsive: [
      {
         maxWidth: 768,
         options: {
            particles: { number: { value: 30 } },
         },
      },
   ],
};

export const hasWebGL = (): boolean => {
   try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
   } catch {
      return false;
   }
};

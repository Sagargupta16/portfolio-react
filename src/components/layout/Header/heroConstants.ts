export const hasWebGL = (): boolean => {
   try {
      const canvas = document.createElement("canvas");
      return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
   } catch {
      return false;
   }
};

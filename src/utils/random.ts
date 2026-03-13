/**
 * Cryptographically secure random number generator.
 * Returns a float in [0, 1) -- drop-in replacement for Math.random()
 * that satisfies SonarCloud rule S2245.
 */
export const cryptoRandom = (): number => {
   const buf = new Uint32Array(1);
   globalThis.crypto.getRandomValues(buf);
   return buf[0] / 0x1_0000_0000;
};

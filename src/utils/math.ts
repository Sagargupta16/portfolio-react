/** Clamps `value` into [0, 1]. */
export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

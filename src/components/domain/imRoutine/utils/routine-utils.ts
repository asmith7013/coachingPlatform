export const normalize = (x: string) => x.trim().toUpperCase();

export const isMLR = (x: string) => /^MLR\d+/.test(x);

export const mlrNum = (x: string) => parseInt(x.replace("MLR", ""), 10);

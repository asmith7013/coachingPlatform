import { z } from "zod";

export const SummerDistricts = [
    "D11",
    "D9",
] as const;

export const Sections313 = [
    "802",
    "803",
    "804",
    "805",
    "603/605",
    "604/704",
    "703/705"
] as const;

export const Teachers313 = [
    "CARDONA",
    "COMPRES",
    "MALUNGA",
    "DELANCER",
    "VIERY",
    "NEWMAN"
] as const;

export const SummerDistrictsZod = z.enum(SummerDistricts);
export type SummerDistrictsType = z.infer<typeof SummerDistrictsZod>;

export const Sections313Zod = z.enum(Sections313);
export type Sections313Type = z.infer<typeof Sections313Zod>;

export const Teachers313Zod = z.enum(Teachers313);
export type Teachers313Type = z.infer<typeof Teachers313Zod>;
import { z } from "zod";

export const SummerDistricts = [
    "D11",
    "D9",
] as const;

export const SummerSections = [
    // D11 subjects
    "SRF",
    "SR6",
    "SR7",
    "SR8",

    // D9 subjects
    "SR1",
    "SR2",
    "SR3",
] as const;

export const SummerTeachers = [
    // D11 sections
    "ISAAC",
    "SCERRA",

    // D9 sections
    "BANIK",
    "VIVAR",
] as const;

export const SummerDistrictsZod = z.enum(SummerDistricts);
export type SummerDistrictsType = z.infer<typeof SummerDistrictsZod>;

export const SummerSectionsZod = z.enum(SummerSections);
export type SummerSectionsType = z.infer<typeof SummerSectionsZod>;

export const SummerTeachersZod = z.enum(SummerTeachers);
export type SummerTeachersType = z.infer<typeof SummerTeachersZod>;
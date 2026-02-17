// Alignment utilities
export const alignments = {
  start: "items-start justify-start",
  center: "items-center justify-center",
  end: "items-end justify-end",
  between: "justify-between",
};

export type Alignment = keyof typeof alignments;

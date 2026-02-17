// src/lib/tokens/sizing.ts

// Icon sizing system (highly repetitive pattern in components)
export const iconSizes = {
  xs: "size-3", // w-3 h-3
  sm: "size-4", // w-4 h-4
  md: "size-5", // w-5 h-5 (most common)
  lg: "size-6", // w-6 h-6 (very common)
  xl: "size-8", // w-8 h-8
  "2xl": "size-12", // w-12 h-12
  "3xl": "size-16", // w-16 h-16
};

// Avatar/profile image sizing
export const avatarSizes = {
  xs: "size-6", // Small profile images
  sm: "size-8", // Small avatars
  md: "size-12", // Standard avatars
  lg: "size-16", // Large profile images
  xl: "size-20", // Hero avatars
  "2xl": "size-24", // Extra large
};

// Type exports for TypeScript
export type IconSizeToken = keyof typeof iconSizes;
export type AvatarSizeToken = keyof typeof avatarSizes;

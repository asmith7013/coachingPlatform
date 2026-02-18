"use client";

import { createTheme } from "@mantine/core";

export const skillsHubTheme = createTheme({
  primaryColor: "teal",
  primaryShade: 7,

  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

  headings: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  components: {
    Button: {
      defaultProps: {
        color: "teal",
      },
    },
    Badge: {
      defaultProps: {
        color: "teal",
      },
    },
    ActionIcon: {
      defaultProps: {
        color: "teal",
      },
    },
  },
});

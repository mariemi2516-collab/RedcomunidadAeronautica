import { useColorScheme } from "react-native";

import colors from "@/constants/colors";

/**
 * Returns the design tokens for the active color scheme plus the shared radius.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;

  return { ...palette, radius: colors.radius };
}

// Define the theme types
export type Theme = {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
  shadow: string;
  buttonBackground: string;
  buttonText: string;
  cardBackground: string;
  textSecondary: string;
  tagBackground: string;
  tagText: string;
  link: string;
};

// Light theme
export const lightTheme: Theme = {
  background: "#FFFFFF",
  text: "#000000",
  primary: "#007AFF",
  secondary: "#8E8E93",
  border: "#E5E5EA",
  shadow: "rgba(0, 0, 0, 0.1)",
  buttonBackground: "#007AFF",
  buttonText: "#FFFFFF",
  cardBackground: "#F2F2F7",
  textSecondary: "#8E8E93",
  tagBackground: "#E5E5EA",
  tagText: "#636366",
  link: "#007AFF",
};

// Dark theme
export const darkTheme: Theme = {
  background: "#1C1C1E",
  text: "#FFFFFF",
  primary: "#0A84FF",
  secondary: "#8E8E93",
  border: "#38383A",
  shadow: "rgba(0, 0, 0, 0.3)",
  buttonBackground: "#0A84FF",
  buttonText: "#FFFFFF",
  cardBackground: "#2C2C2E",
  textSecondary: "#8E8E93",
  tagBackground: "#38383A",
  tagText: "#AEAEB2",
  link: "#0A84FF",
};

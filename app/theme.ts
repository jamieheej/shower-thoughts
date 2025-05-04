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
  headerBackground: string;
  tabBarBackground: string;
};

// Light theme
export const lightTheme: Theme = {
  background: "#FFFFFF",
  text: "#000000",
  primary: "#333333",
  secondary: "#8E8E93",
  border: "#E5E5EA",
  shadow: "rgba(0, 0, 0, 0.1)",
  buttonBackground: "#333333",
  buttonText: "#FFFFFF",
  cardBackground: "#F2F2F7",
  textSecondary: "#8E8E93",
  tagBackground: "#E5E5EA",
  tagText: "#636366",
  link: "#333333",
  headerBackground: "#f8f8f8",
  tabBarBackground: "#f8f8f8",
};

// Dark theme
export const darkTheme: Theme = {
  background: "#1C1C1E",
  text: "#FFFFFF",
  primary: "#BBBBBB",
  secondary: "#8E8E93",
  border: "#38383A",
  shadow: "rgba(0, 0, 0, 0.3)",
  buttonBackground: "#BBBBBB",
  buttonText: "#000000",
  cardBackground: "#2C2C2E",
  textSecondary: "#8E8E93",
  tagBackground: "#38383A",
  tagText: "#AEAEB2",
  link: "#BBBBBB",
  headerBackground: "#1e1e1e",
  tabBarBackground: "#1e1e1e",
};

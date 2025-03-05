import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, createContext, useContext } from "react";
import "react-native-reanimated";
import { Slot } from "expo-router";

import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProvider } from "./(context)/UserContext";
import React from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a Theme Context
const ThemeContext = createContext<{
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
}>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [theme, setTheme] = useState(colorScheme);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  if (theme === null || theme === undefined) {
    return null;
  }
  
  return (
    // <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserProvider>
        <Slot />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </UserProvider>
    // </ThemeContext.Provider>
  );
}

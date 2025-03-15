import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, createContext, useContext } from "react";
import "react-native-reanimated";
import { Slot, Stack } from "expo-router";
import React from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProvider, useUser } from "./(context)/UserContext";
import NewThoughtScreen from "./NewThought";

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
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
      <RootLayoutContent />
    </UserProvider>
  );
}

function RootLayoutContent() {
  const { theme } = useUser();
  
  if (theme === null || theme === undefined) {
    return null;
  }
  
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="NewThought" 
          options={{
            presentation: 'card',
            headerShown: true,
            headerBackTitle: 'Back',
            title: 'New Thought',
            headerStyle: {
              backgroundColor: theme.background,
            },
            headerTintColor: theme.text,
          }}
        />
        <Stack.Screen name="(screens)/[thought]" options={{ headerShown: false }} />
        <Stack.Screen name="Home" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={theme.background === '#000' ? 'light' : 'dark'} />
    </>
  );
}

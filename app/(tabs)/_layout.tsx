import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useUser } from "../(context)/UserContext"; // Ensure this import is correct
import { ThemeProvider } from "@react-navigation/native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import ThoughtsScreen from "./Thoughts";
import SettingsScreen from "./Settings";
import NewThoughtScreen from "../NewThought";
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const { theme, isDarkTheme } = useUser(); // Get the current theme

  return (
    <ThemeProvider value={isDarkTheme ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          tabBarActiveTintColor: theme.text,
          tabBarInactiveTintColor: theme.border,
          tabBarShowLabel: false,
          tabBarIconStyle: {
            marginTop: 5,
            marginBottom: 5,
          }
        }}
      >
        <Tab.Screen 
          name="Thoughts" 
          component={ThoughtsScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }} 
        />
        <Tab.Screen 
          name="New Thought" 
          component={NewThoughtScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }} 
        />
      </Tab.Navigator>
      <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
    </ThemeProvider>
  );
} 
import { Tabs } from "expo-router";
import { useTheme } from "../_layout";
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { theme } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme === 'dark' ? '#fff' : '#000',
        tabBarInactiveTintColor: theme === 'dark' ? '#888' : '#999',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#121212' : '#fff',
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="Thoughts"
        options={{
          title: "Thoughts",
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="NewThought"
        options={{
          title: "New Thought",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 
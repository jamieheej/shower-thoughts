import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '.';
import ThoughtsScreen from './Thoughts';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
};

export default function TabLayout() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="index"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="Thoughts"
          component={ThoughtsScreen}
          options={{ title: 'Thoughts' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

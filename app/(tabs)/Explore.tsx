import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '../(context)/UserContext';

export default function ExploreScreen() {
  const { theme } = useUser();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>
        Explore feature coming soon!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
}); 
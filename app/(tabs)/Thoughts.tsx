import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const ThoughtsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thoughts</Text>
      <Text style={styles.description}>This is where your thoughts will be displayed.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
});

export default ThoughtsScreen;

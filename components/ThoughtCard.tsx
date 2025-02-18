import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ThoughtCardProps = {
  thought: {
    title: string;
    content: string;
    id: string;
  };
  onPress: () => void;
};

const ThoughtCard: React.FC<ThoughtCardProps> = ({ thought, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{thought.id}</Text>
      <Text style={styles.title}>{thought.title}</Text>
      <Text style={styles.content}>{thought.content}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 14,
    color: '#333',
  },
});

export default ThoughtCard; 
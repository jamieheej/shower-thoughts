import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ThoughtCardProps = {
  thought: {
    title: string;
    content: string;
    id: string;
    tags: string[];
  };
  onPress: () => void;
};

const ThoughtCard: React.FC<ThoughtCardProps> = ({ thought, onPress }) => {

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{thought.title}</Text>
      <Text style={styles.content}>{thought.content}</Text>
      <View style={styles.tagsContainer}>
        {thought.tags && thought.tags.length > 0 ? (
          thought.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>{tag}</Text>
          ))
        ) : (
          <Text style={styles.noTags}>No tags available</Text>
        )}
      </View>
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  
  noTags: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

export default ThoughtCard; 
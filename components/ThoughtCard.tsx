import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Tag from './Tag';
import { useUser } from '@/app/(context)/UserContext';

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
  const { theme } = useUser();
  const styles = StyleSheet.create({
    card: {
      padding: 16,
      marginVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.background,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.text,
    },
    content: {
      fontSize: 14,
      color: theme.text,
      marginBottom: 12,
      lineHeight: 20,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    noTags: {
      color: '#999999',
      fontStyle: 'italic',
      fontSize: 12,
    },
  });
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{thought.title}</Text>
      <Text style={styles.content}>{thought.content}</Text>
      <View style={styles.tagsContainer}>
        {thought.tags && thought.tags.length > 0 ? (
          thought.tags.map((tag, index) => (
            <Tag key={index} label={tag} />
          ))
        ) : (
          <Text style={styles.noTags}>No tags available</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};


export default ThoughtCard; 
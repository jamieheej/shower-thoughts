import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Tag from './Tag';
import { useUser } from '@/app/(context)/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/dateUtils';

type ThoughtCardProps = {
  thought: {
    id: string;
    title: string;
    content: string;
    date: string;
    tags: string[];
    favorite?: boolean;
  };
  onPress: () => void;
  onToggleFavorite: () => void;
};

const ThoughtCard = ({ thought, onPress, onToggleFavorite }: ThoughtCardProps) => {
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.text,
    },
    favoriteButton: {
      padding: 4,
    },
    date: {
      fontSize: 12,
      marginBottom: 8,
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
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.background }]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{thought.title}</Text>
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the card's onPress
            onToggleFavorite();
          }}
          style={styles.favoriteButton}
        >
          <Ionicons 
            name={thought.favorite ? "heart" : "heart-outline"} 
            size={24} 
            color={thought.favorite ? theme.text : theme.text} 
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.date, { color: theme.secondary }]}>
        {formatDate(thought.date)}
      </Text>
      <Text 
        style={[styles.content, { color: theme.text }]}
        numberOfLines={2}
      >
        {thought.content}
      </Text>
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
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import Tag from './Tag';
import { useUser } from '@/app/(context)/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/dateUtils';
import { shareThought } from '@/utils/shareUtils';

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
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 4,
      marginLeft: 8,
    },
  });
  
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.background }]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{thought.title}</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            style={styles.actionButton}
          >
            <Ionicons 
              name={thought.favorite ? "heart" : "heart-outline"} 
              size={24} 
              color={thought.favorite ? theme.text : theme.text} 
            />
          </TouchableOpacity>
          
          {/* Add Share Button */}
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              shareThought(thought);
            }}
            style={styles.actionButton}
          >
            <Ionicons name="share-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
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
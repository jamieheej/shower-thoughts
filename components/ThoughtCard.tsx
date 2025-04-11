import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/app/(context)/UserContext';
import { formatDate } from '@/utils/dateUtils';

type ThoughtCardProps = {
  thought: {
    id: string;
    title: string;
    content: string;
    date: string;
    tags?: string[];
    favorite?: boolean;
  };
  onPress: () => void;
  onToggleFavorite: () => void;
};

const ThoughtCard = ({ thought, onPress, onToggleFavorite }: ThoughtCardProps) => {
  const { theme } = useUser();
  
  // Truncate content to a reasonable preview length
  const contentPreview = thought.content.length > 100 
    ? thought.content.substring(0, 100) + '...' 
    : thought.content;
  
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.cardBackground }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.titleContainer}>
          <Text 
            style={[styles.title, { color: theme.text }]} 
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {thought.title}
          </Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            onPress={onToggleFavorite}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={thought.favorite ? "heart" : "heart-outline"} 
              size={20} 
              color={thought.favorite ? theme.primary : theme.text} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text 
        style={[styles.content, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {contentPreview}
      </Text>
      
      <View style={styles.footer}>
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {formatDate(thought.date)}
        </Text>
        
        {thought.tags && thought.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {thought.tags.slice(0, 2).map((tag, index) => (
              <View 
                key={index} 
                style={[styles.tag, { backgroundColor: theme.tagBackground }]}
              >
                <Text 
                  style={[styles.tagText, { color: theme.tagText }]}
                  numberOfLines={1}
                >
                  {tag}
                </Text>
              </View>
            ))}
            {thought.tags.length > 2 && (
              <View style={styles.moreTagContainer}>
                <Text style={[styles.moreTag, { color: theme.textSecondary }]}>
                  +{thought.tags.length - 2}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  tag: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTagContainer: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreTag: {
    fontSize: 10,
    fontWeight: '500',
  }
});

export default ThoughtCard; 
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useUser } from '../(context)/UserContext';
import ThoughtCard from '@/components/ThoughtCard';
import { Ionicons } from '@expo/vector-icons';

// Sample public thoughts for MVP
const samplePublicThoughts = [
  {
    id: 'public-1',
    title: 'The Universe is Vast',
    content: 'If the universe is infinite, then somewhere there must be a planet exactly like Earth with someone exactly like you reading this exact thought.',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    tags: ['universe', 'philosophy'],
    favorite: false,
    userId: 'public-user-1',
  },
  {
    id: 'public-2',
    title: 'Shower Paradox',
    content: 'The dirtier you are, the cleaner the shower water makes you, but the cleaner you get, the dirtier the shower water becomes.',
    date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    tags: ['shower', 'paradox'],
    favorite: false,
    userId: 'public-user-2',
  },
  {
    id: 'public-3',
    title: 'Language Evolution',
    content: 'Every word in every language was made up by someone at some point in history.',
    date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    tags: ['language', 'history'],
    favorite: false,
    userId: 'public-user-3',
  },
  {
    id: 'public-4',
    title: 'Digital Memories',
    content: 'Future generations will have their entire lives documented in photos and videos, unlike any generation before them.',
    date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    tags: ['technology', 'future'],
    favorite: false,
    userId: 'public-user-4',
  },
  {
    id: 'public-5',
    title: 'Ocean Perspective',
    content: 'The ocean is both a barrier and a connection between continents, depending on your technological capabilities.',
    date: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
    tags: ['ocean', 'perspective'],
    favorite: false,
    userId: 'public-user-5',
  },
];

// Define the Thought type
type Thought = {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  favorite: boolean;
  userId: string;
};

export default function ExploreScreen() {
  const { theme } = useUser();
  const [loading, setLoading] = useState(true);
  const [publicThoughts, setPublicThoughts] = useState<Thought[]>([]);

  // Simulate loading public thoughts
  useEffect(() => {
    const loadPublicThoughts = async () => {
      // Simulate network delay
      setTimeout(() => {
        // Sort by date (newest first)
        const sortedThoughts = [...samplePublicThoughts].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setPublicThoughts(sortedThoughts);
        setLoading(false);
      }, 1000);
    };

    loadPublicThoughts();
  }, []);

  // Placeholder for when a thought card is pressed (no action for MVP)
  const handleThoughtPress = (thoughtId: string) => {
    // No action for MVP
    console.log(`Thought ${thoughtId} pressed - feature coming soon`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.text} />
      ) : (
        <FlatList
          data={publicThoughts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThoughtCard 
              thought={item}
              onPress={() => handleThoughtPress(item.id)}
              onToggleFavorite={() => {}} // No action for MVP
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No public thoughts available yet
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerContainer}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Explore Public Thoughts
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                Discover interesting thoughts from around the world
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  }
}); 
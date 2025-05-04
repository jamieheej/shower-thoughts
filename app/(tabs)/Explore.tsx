import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useUser } from '../(context)/UserContext';
import ThoughtCard from '@/components/ThoughtCard';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig';
import { getLocalThoughts, LocalThought } from '@/utils/localStorageService';
import { useFocusEffect } from '@react-navigation/native';

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
  public: boolean;
};

export default function ExploreScreen() {
  const { theme, isGuestMode } = useUser();
  const [loading, setLoading] = useState(true);
  const [publicThoughts, setPublicThoughts] = useState<Thought[] | LocalThought[]>([]);

  // Function to load public thoughts
  const loadPublicThoughts = async () => {
    setLoading(true);
    
    try {
      if (isGuestMode) {
        // For guest mode, try to get public thoughts from AsyncStorage first
        // If none exist, fall back to sample thoughts
        try {
          const parsedThoughts = await getLocalThoughts();
          if (parsedThoughts) {
            const publicThoughtsFromStorage = parsedThoughts.filter(
              (thought: LocalThought) => thought.public === true
            );
            
            if (publicThoughtsFromStorage.length > 0) {
              // Sort by date (newest first)
              const sortedThoughts = [...publicThoughtsFromStorage].sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
              });
              setPublicThoughts(sortedThoughts);
            } else {
              // If no public thoughts in storage, use sample thoughts
              const sortedThoughts = [...samplePublicThoughts].sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
              });
              setPublicThoughts(sortedThoughts as Thought[]);
            }
          } else {
            // If no thoughts in storage, use sample thoughts
            const sortedThoughts = [...samplePublicThoughts].sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setPublicThoughts(sortedThoughts as Thought[]);
          }
        } catch (error) {
          console.error('Error reading from AsyncStorage:', error);
          // Fallback to sample thoughts
          const sortedThoughts = [...samplePublicThoughts].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setPublicThoughts(sortedThoughts as Thought[]);
        }
      } else {
        // For authenticated users, fetch public thoughts from Firestore
        const thoughtsRef = collection(db, 'thoughts');
        const q = query(
          thoughtsRef, 
          where('public', '==', true),
          orderBy('date', 'desc')
        );
        
        try {
          const querySnapshot = await getDocs(q);
          const thoughts: Thought[] = [];
          
          querySnapshot.forEach((doc) => {
            thoughts.push({ id: doc.id, ...doc.data() } as Thought);
          });
          
          setPublicThoughts(thoughts);
        } catch (error) {
          console.error('Error fetching public thoughts from Firestore:', error);
          // Fallback to sample thoughts if there's a permission error
          const sortedThoughts = [...samplePublicThoughts].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          });
          setPublicThoughts(sortedThoughts as Thought[]);
        }
      }
    } catch (error) {
      console.error('Error loading public thoughts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to reload data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPublicThoughts();
      return () => {
        // Optional cleanup if needed
      };
    }, [isGuestMode])
  );

  // Initial load (can be removed if you only want to load on focus)
  useEffect(() => {
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
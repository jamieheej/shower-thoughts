import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useUser } from '../(context)/UserContext';
import ThoughtCard from '@/components/ThoughtCard';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig';
import { getLocalThoughts, LocalThought, samplePublicThoughts, saveLocalThoughts } from '@/utils/localStorageService';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

// Define the Thought type
type Thought = {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  favorite?: boolean;
  userId: string;
  public?: boolean;
};

export default function ExploreScreen() {
  const { theme, isGuestMode, userInfo } = useUser();
  const [loading, setLoading] = useState(true);
  const [publicThoughts, setPublicThoughts] = useState<Thought[] | LocalThought[]>([]);
  const router = useRouter();

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

  // Add a function to handle liking thoughts
const handleToggleLike = async (thoughtId: string) => {
  // Find the thought in the current list
  const updatedThoughts = publicThoughts.map(thought => {
    if (thought.id === thoughtId) {
      // Toggle the like state
      const isLiked = thought.favorite || false;
      
      // Return updated thought with toggled favorite state and updated likes count
      return {
        ...thought,
        favorite: !isLiked,
      };
    }
    return thought;
  });
  
  // Update state with the new array
  setPublicThoughts(updatedThoughts as (Thought | LocalThought)[]);
  
  // If user is logged in, persist this change
  try {
    const thoughtToUpdate = publicThoughts.find(t => t.id === thoughtId);
    
    if (!thoughtToUpdate) return;
    
    if (isGuestMode) {
      // For guest mode, update in local storage
      const localThoughts = await getLocalThoughts();
      const updatedLocalThoughts = localThoughts.map(t => {
        if (t.id === thoughtId) {
          const isLiked = t.favorite || false;
          return {
            ...t,
            favorite: !isLiked,
          };
        }
        return t;
      });
      
      await saveLocalThoughts(updatedLocalThoughts);
    } else if (userInfo?.id) {
      // For logged in users, update in Firestore
      // This is a simplified approach - in a real app you'd track likes per user
      const thoughtRef = doc(db, 'thoughts', thoughtId);
      const isLiked = thoughtToUpdate.favorite || false;
      
      await updateDoc(thoughtRef, {
        favorite: !isLiked,
      });
    }
  } catch (error) {
    console.error('Error updating like status:', error);
    // Revert the UI change if the update fails
    loadPublicThoughts();
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

  const handleThoughtPress = (thoughtId: string) => {
    router.push(`/(screens)/${thoughtId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.text} />
      ) : (
        <FlatList
          data={publicThoughts as (Thought | LocalThought)[]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThoughtCard 
              thought={item}
              onPress={() => handleThoughtPress(item.id)}
              onToggleFavorite={() => handleToggleLike(item.id)}
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
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig'; 
import ThoughtCard from '@/components/ThoughtCard';
import { useUser } from '../(context)/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getLocalThoughts, saveLocalThoughts } from '@/utils/localStorageService';
import GuestPrompt from '@/components/GuestPrompt';
import { useFocusEffect } from '@react-navigation/native';

type Thought = {
    title: string;
    content: string;
    date: string;
    id: string;
    tags: string[];
    favorite?: boolean;
    userId: string;
}

export default function ThoughtsScreen() {
  console.log("ThoughtsScreen rendering");
  const router = useRouter();
  const { isGuestMode, theme, userInfo } = useUser();
  const currentUserId = getAuth().currentUser?.uid;
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Load thoughts based on authentication state
  useEffect(() => {
    // For authenticated users
    if (!isGuestMode && userInfo) {
      // User is authenticated, load from Firestore
      const thoughtsRef = collection(db, 'thoughts');
      const q = query(thoughtsRef, where('userId', '==', userInfo.id));
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const thoughtsData: Thought[] = [];
          querySnapshot.forEach((doc) => {
            thoughtsData.push({ id: doc.id, ...doc.data() } as Thought);
          });
          setThoughts(thoughtsData);
        },
        (error) => {
          console.error("Firestore error:", error);
          setThoughts([]);
        }
      );
      
      return () => unsubscribe();
    } 
    // For guest mode
    else if (isGuestMode) {
      // No redirection needed
    }
    // Not guest mode and not authenticated - redirect to home
    else if (!isGuestMode && !userInfo) {
      const timer = setTimeout(() => {
        router.replace('/Home');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isGuestMode, userInfo]);

  // Load local thoughts for guest mode
  useFocusEffect(
    useCallback(() => {
      console.log("useFocusEffect running, isGuestMode:", isGuestMode);
      
      if (!isGuestMode) return;
      
      const loadLocalThoughts = async () => {
        setLoading(true);
        try {
          const localThoughts = await getLocalThoughts();
          setThoughts(localThoughts);
        } catch (error) {
          console.error('Error loading local thoughts:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadLocalThoughts();
    }, [isGuestMode])
  );

  // Toggle favorite status
  const handleToggleFavorite = async (thought: Thought) => {
    const updatedThought = { ...thought, favorite: !thought.favorite };
    
    if (isGuestMode) {
      // Update in local storage for guest mode
      const updatedThoughts = thoughts.map(t => 
        t.id === thought.id ? updatedThought : t
      );
      setThoughts(updatedThoughts);
      await saveLocalThoughts(updatedThoughts);
    } else {
      // Update in Firestore for authenticated users
      try {
        const thoughtRef = doc(db, 'thoughts', thought.id);
        await updateDoc(thoughtRef, { favorite: !thought.favorite });
      } catch (error) {
        console.error('Error updating favorite status:', error);
      }
    }
  };

  // Filter thoughts based on search and favorites
  const filteredThoughts = thoughts
    .filter(thought => {
      // First apply favorites filter if enabled
      if (showFavoritesOnly && !thought.favorite) {
        return false;
      }
      
      // Then apply search filter if there's a query
      if (searchQuery.trim() !== '') {
        return thought.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               thought.content.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isGuestMode && <GuestPrompt />}
      
      <View style={styles.filterContainer}>
        <View style={[styles.searchBarContainer, { backgroundColor: theme.border, flex: 1 }]}>
          <TextInput 
            style={[styles.searchBar, { color: theme.text }]} 
            placeholder="Search thoughts..." 
            placeholderTextColor={theme.text}
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.favoriteFilterButton, 
            { 
              backgroundColor: showFavoritesOnly ? theme.primary : 'transparent',
              borderColor: theme.primary
            }
          ]} 
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Ionicons 
            name="heart" 
            size={24} 
            color={showFavoritesOnly ? theme.buttonText : theme.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.text} />
      ) : (
        <FlatList
          data={filteredThoughts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThoughtCard 
              thought={item}
              onPress={() => router.push(`/(screens)/${item.id}`)}
              onToggleFavorite={() => handleToggleFavorite(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                {showFavoritesOnly 
                  ? "No favorite thoughts yet" 
                  : searchQuery.trim() !== '' 
                    ? "No thoughts match your search" 
                    : "No thoughts yet. Add your first one!"}
              </Text>
            </View>
          }
        />
      )}
      
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/NewThought")}
      >
        <Ionicons name="add" size={24} color={theme.buttonText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 15,
  },
  searchBar: {
    flex: 1,
    height: 46,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  favoriteFilterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  floatingButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 30,
    right: 30,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});



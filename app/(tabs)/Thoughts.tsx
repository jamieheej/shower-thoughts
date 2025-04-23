import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
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
  const router = useRouter();
  const { isGuestMode, theme, userInfo } = useUser();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

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
      borderColor: theme.border,
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
  
  // Load thoughts based on authentication state
  useEffect(() => {
    // For authenticated users
    const currentUser = getAuth().currentUser;
    
    if (!isGuestMode && currentUser) {
      // User is authenticated, load from Firestore
      const thoughtsRef = collection(db, 'thoughts');
      
      // Create a base query for the user's thoughts
      let q = query(thoughtsRef, where('userId', '==', currentUser.uid));
      
      // Add sorting to show newest first
      q = query(q, orderBy('date', 'desc'));
      
      // If showing favorites only, add that filter
      if (showFavoritesOnly) {
        q = query(q, where('favorite', '==', true));
      }
      
      // If there's a search query, we still need to filter client-side
      // as Firestore doesn't support full-text search natively
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const thoughtsData: Thought[] = [];
          querySnapshot.forEach((doc) => {
            thoughtsData.push({ id: doc.id, ...doc.data() } as Thought);
          });
          
          // If there's a search query, filter client-side
          if (searchQuery.trim() !== '') {
            const filteredData = thoughtsData.filter(thought => 
              thought.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              thought.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setThoughts(filteredData);
          } else {
            setThoughts(thoughtsData);
          }
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
  }, [isGuestMode, userInfo, showFavoritesOnly, searchQuery]);

  // Load local thoughts for guest mode
  useFocusEffect(
    useCallback(() => {
      if (!isGuestMode) return;
      
      const loadLocalThoughts = async () => {
        setLoading(true);
        try {
          let localThoughts = await getLocalThoughts();
          
          // Sort by date (newest first)
          localThoughts = localThoughts.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          });
          
          // Apply filters
          if (showFavoritesOnly || searchQuery.trim() !== '') {
            localThoughts = localThoughts.filter(thought => {
              // Apply favorites filter
              if (showFavoritesOnly && !thought.favorite) {
                return false;
              }
              
              // Apply search filter
              if (searchQuery.trim() !== '') {
                return thought.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       thought.content.toLowerCase().includes(searchQuery.toLowerCase());
              }
              
              return true;
            });
          }
          
          setThoughts(localThoughts);
        } catch (error) {
          console.error('Error loading local thoughts:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadLocalThoughts();
    }, [isGuestMode, showFavoritesOnly, searchQuery])
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

  const handlePress = useCallback((id: string) => {
    router.push(`/(screens)/${id}`);
  }, [router]);

  const handleToggleFav = useCallback((thought: Thought) => {
    handleToggleFavorite(thought);
  }, [handleToggleFavorite]);

  const getItemLayout = (data: any, index: number) => ({
    length: 150, // Approximate height of your ThoughtCard
    offset: 150 * index,
    index,
  });

  // Memoize your empty component
  const EmptyListComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.text }]}>
        {showFavoritesOnly 
          ? "No favorite thoughts yet" 
          : searchQuery.trim() !== '' 
            ? "No thoughts match your search" 
            : "No thoughts yet. Add your first one!"}
      </Text>
    </View>
  ), [showFavoritesOnly, searchQuery, theme.text]);

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
          data={thoughts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThoughtCard 
              thought={item}
              onPress={() => handlePress(item.id)}
              onToggleFavorite={() => handleToggleFav(item)}
            />
          )}
          ListEmptyComponent={EmptyListComponent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
          getItemLayout={getItemLayout}
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




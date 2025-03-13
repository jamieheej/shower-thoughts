import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ThoughtCard from '@/components/ThoughtCard';
import { useUser } from '../(context)/UserContext';
import { Ionicons } from '@expo/vector-icons';

type Thought = {
    title: string;
    content: string;
    date: string;
    id: string;
    tags: string[];
}

export default function ThoughtsScreen() {
  const router = useRouter();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [allThoughts, setAllThoughts] = useState<Thought[]>([]);
  const currentUserId = GoogleSignin.getCurrentUser()?.user.id;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const { theme } = useUser();


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 50,
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    searchBar: {
      flex: 1,
      height: 46,
      fontSize: 16,
      color: '#333',
    },
    clearButton: {
      padding: 8,
    },
    floatingButton: {
      position: 'absolute',
      width: 50,
      height: 50,
      bottom: 30,
      right: 30,
      borderRadius: 10,
      padding: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 24,
      // color will be set dynamically in the TouchableOpacity
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
    }
  });

  useEffect(() => {
    const thoughtsRef = collection(db, 'thoughts');
    const q = query(thoughtsRef, where('userId', '==', currentUserId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const thoughtsData: Thought[] = [];
      querySnapshot.forEach((doc) => {
        thoughtsData.push({ id: doc.id, ...doc.data() } as Thought);
      });
      setAllThoughts(thoughtsData);
      // Don't set thoughts here, let the search effect handle it
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Combined search and pagination effect
  useEffect(() => {
    let filteredResults = [...allThoughts];
    
    // Apply search filter if query exists
    if (searchQuery.trim() !== '') {
      filteredResults = allThoughts.filter(thought =>
        thought.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        thought.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply pagination
    const paginatedResults = filteredResults.slice(0, page * itemsPerPage);
    setThoughts(paginatedResults);
    
  }, [searchQuery, allThoughts, page]);

  // Handle search with debounce
  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(() => {
      // Reset page when search changes
      setPage(1);
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const loadMoreThoughts = () => {
    if (thoughts.length < allThoughts.length) {
      const nextPage = page + 1;
      const newThoughts = allThoughts.slice(0, nextPage * itemsPerPage);
      setThoughts(newThoughts);
      setPage(nextPage);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchBarContainer, { backgroundColor: theme.border }]}>
        <TextInput 
          style={[styles.searchBar, { borderColor: theme.border, color: theme.text }]} 
          placeholder="Search thoughts..." 
          placeholderTextColor={theme.text}
          onChangeText={text => setSearchQuery(text)}
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
      {loading ? (
        <ActivityIndicator size="large" color="black" style={styles.loader} />
      ) : (
        <FlatList
          data={thoughts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThoughtCard 
              thought={item}
              onPress={() => router.push(`/(screens)/${item.id}`)} // Use actual navigation
            />
          )}
          onEndReached={loadMoreThoughts}
          onEndReachedThreshold={0.5}
        />
      )}
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: theme.text }]} // Use text color for background
        onPress={() => router.push("/(tabs)/NewThought")}
      >
        <Ionicons name="add" size={24} color={theme.buttonBackground} />
      </TouchableOpacity>
    </View>
  );
};



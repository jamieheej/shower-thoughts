import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ThoughtCard from '../../components/ThoughtCard';

type Thought = {
    title: string;
    content: string;
    date: string;
    id: string;
}

export default function Thoughts() {
  const router = useRouter();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [allThoughts, setAllThoughts] = useState<Thought[]>([]);
  const currentUserId = GoogleSignin.getCurrentUser()?.user.id;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  useEffect(() => {
    const thoughtsRef = collection(db, 'thoughts');
    const q = query(thoughtsRef, where('userId', '==', currentUserId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const thoughtsData: Thought[] = [];
      querySnapshot.forEach((doc) => {
        thoughtsData.push({ id: doc.id, ...doc.data() } as Thought);
      });
      setAllThoughts(thoughtsData);
      setThoughts(thoughtsData.slice(0, itemsPerPage));
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const loadMoreThoughts = () => {
    if (thoughts.length < allThoughts.length) {
      const nextPage = page + 1;
      const newThoughts = allThoughts.slice(0, nextPage * itemsPerPage);
      setThoughts(newThoughts);
      setPage(nextPage);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      if (searchQuery.trim() === '') {
        setThoughts(allThoughts.slice(0, page * itemsPerPage));
      } else {
        const filteredThoughts = allThoughts.filter(thought =>
          thought.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          thought.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setThoughts(filteredThoughts.slice(0, page * itemsPerPage));
      }
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, allThoughts, page]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thoughts</Text>
      <TextInput 
        style={styles.searchBar} 
        placeholder="Search thoughts..." 
        onChangeText={text => setSearchQuery(text)}
      />
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
      <TouchableOpacity style={styles.floatingButton} onPress={() => router.replace("/(tabs)/NewThought")}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  floatingButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 30,
    right: 30,
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
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
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig'; // Adjust the import based on your Firebase setup
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ThoughtCard from '../../components/ThoughtCard'; // Import the new ThoughtCard component

type Thought = {
    title: string;
    content: string;
    date: string;
    id: string;
}

const Thoughts: React.FC = () => {
  const router = useRouter();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const currentUserId = GoogleSignin.getCurrentUser()?.user.id;

  useEffect(() => {
    const thoughtsRef = collection(db, 'thoughts');
    const q = query(thoughtsRef, where('userId', '==', currentUserId)); // Filter by userId

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const thoughtsData: Thought[] = [];
      querySnapshot.forEach((doc) => {
        thoughtsData.push({ id: doc.id, ...doc.data() } as Thought);
      });
      setThoughts(thoughtsData);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thoughts</Text>
      <TextInput style={styles.searchBar} placeholder="Search thoughts..." />
      <FlatList
        data={thoughts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThoughtCard 
            thought={item}
            onPress={() => router.push(`/(screens)/${item.id}`)}
          />
        )}
      />
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
});

export default Thoughts; 
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import Tag from '@/components/Tag';
import { useUser } from '../(context)/UserContext'; // Import useUser
import { getLocalThoughts, updateLocalThought, deleteLocalThought } from '@/utils/localStorageService';

// Add this type definition at the top of your file
type Thought = {
  id: string;
  title: string;
  content: string;
  date?: string;
  tags?: string[];
  userId?: string;
};

const Thought = () => {
  const localSearchParams = useLocalSearchParams();
  const id = localSearchParams.thought as string;
  const [thought, setThought] = useState<Thought | null>(null);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const { theme, isGuestMode } = useUser(); // Get the current theme and guest mode

  useEffect(() => {
    const loadThought = async () => {
      if (isGuestMode) {
        // Load from local storage for guest mode
        const localThoughts = await getLocalThoughts();
        const foundThought = localThoughts.find(t => t.id === id);
        if (foundThought) {
          setThought(foundThought);
        }
      } else {
        // Load from Firestore for authenticated users
        const docRef = doc(db, 'thoughts', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setThought({ id: docSnap.id, ...docSnap.data() } as Thought);
        }
      }
    };
    
    loadThought();
  }, [id, isGuestMode]);

  const handleDelete = async () => {
    try {
      if (isGuestMode) {
        // Delete from local storage for guest mode
        await deleteLocalThought(id);
        router.back();
      } else {
        // Delete from Firestore for authenticated users
        await deleteDoc(doc(db, 'thoughts', id));
        router.back();
      }
    } catch (error) {
      console.error('Error deleting thought:', error);
      Alert.alert('Error', 'Failed to delete thought');
    }
  };

  const handleSave = async () => {
    try {
      if (isGuestMode) {
        // Update in local storage for guest mode
        if (thought) {
          await updateLocalThought({
            ...thought,
            title: thought.title,
            content: thought.content,
            tags: tags || [],
            date: thought.date || new Date().toISOString() // Ensure date is always a string
          });
        }
      } else {
        // Update in Firestore for authenticated users
        const thoughtRef = doc(db, 'thoughts', id);
        await setDoc(thoughtRef, {
          title: thought?.title,
          content: thought?.content,
          tags: tags
        }, { merge: true });
      }
      
      Alert.alert('Success', 'Thought saved successfully');
    } catch (error) {
      console.error('Error updating thought:', error);
      Alert.alert('Error', 'Failed to save thought');
    } finally {
      setIsEditing(false);
    }
  };

  if (!id) {
    return <Text>Error: No ID provided</Text>;
  }

  if (!thought) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/(tabs)/Thoughts')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {thought.title}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      {isEditing ? (
        <>
          <TextInput
            style={[styles.titleInput, { borderColor: theme.border, color: theme.text }]}
            value={thought.title}
            onChangeText={(text) => setThought({ ...thought, title: text })}
          />
          <TextInput
            style={[styles.contentInput, { borderColor: theme.border, color: theme.text }]}
            value={thought.content}
            onChangeText={(text) => setThought({ ...thought, content: text })}
            multiline
          />
          <TextInput
            style={[styles.tagsInput, { borderColor: theme.border, color: theme.text }]}
            value={tags.join(', ')}
            onChangeText={(text) => {
              const newTags = text.split(',').map(tag => tag.trim());
              setTags(newTags);
              setThought({ ...thought, tags: newTags });
            }}
            placeholder="Enter tags separated by commas"
            placeholderTextColor={theme.text}
          />
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.buttonBackground }]} onPress={handleSave}>
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>Save</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.title, { color: theme.text }]}>{thought.title}</Text>
          <Text style={[styles.content, { color: theme.text }]}>{thought.content}</Text>
          {thought.tags && (
            <View style={styles.tagsContainer}>
              {thought.tags.map((tag, index) => (
                <Tag key={index} label={tag} />
              ))}
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 30, // To balance the header
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    marginVertical: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  contentInput: {
    fontSize: 16,
    marginVertical: 20,
    borderWidth: 1,
    padding: 10,
    minHeight: 200,
    textAlignVertical: 'top',
    borderRadius: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  tagsInput: {
    fontSize: 16,
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#333333',
  },
  deleteButton: {
    backgroundColor: '#666666',
  },
  saveButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Thought; 
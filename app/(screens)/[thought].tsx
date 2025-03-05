import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import Tag from '@/components/Tag';

const Thought = () => {
  const localSearchParams = useLocalSearchParams();
  const id = localSearchParams.thought as string;
  const [thought, setThought] = useState<{ title: string; content: string; tags?: string[] } | null>(null);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchThought = async () => {
      const thoughtRef = doc(db, 'thoughts', id);
      const thoughtData = await getDoc(thoughtRef);
      const data = thoughtData.data() as { title: string; content: string; tags?: string[] } | null || null; // Cast to expected type
      setThought(data);
      setTags(data?.tags || []);
    };

    fetchThought();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'thoughts', id));
      Alert.alert('Success', 'Thought deleted successfully');
      router.push('/(tabs)/Thoughts');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete thought');
    }
  };

  const handleSave = async () => {
    try {
      const thoughtRef = doc(db, 'thoughts', id);
      await setDoc(thoughtRef, thought);
      Alert.alert('Success', 'Thought saved successfully');
    } catch (error) {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/(tabs)/Thoughts')}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {thought.title}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      {isEditing ? (
        <>
          <TextInput
            style={styles.titleInput}
            value={thought.title}
            onChangeText={(text) => setThought({ ...thought, title: text })}
          />
          <TextInput
            style={styles.contentInput}
            value={thought.content}
            onChangeText={(text) => setThought({ ...thought, content: text })}
            multiline
          />
          <TextInput
            style={styles.tagsInput}
            value={tags.join(', ')}
            onChangeText={(text) => {
              const newTags = text.split(',').map(tag => tag.trim());
              setTags(newTags);
              setThought({ ...thought, tags: newTags });
            }}
            placeholder="Enter tags separated by commas"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>{thought.title}</Text>
          <Text style={styles.content}>{thought.content}</Text>
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
  tag: {
    backgroundColor: '#f5f2e8',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e8e2d0',
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
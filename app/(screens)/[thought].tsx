import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig';

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
          <Button title="Save" onPress={handleSave} />
        </>
      ) : (
        <>
          <Text style={styles.title}>{thought.title}</Text>
          <Text style={styles.content}>{thought.content}</Text>
          {thought.tags && (
            <View style={styles.tagsContainer}>
              {thought.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          )}
          <Button title="Edit" onPress={() => setIsEditing(true)} />
          <Button title="Delete" onPress={handleDelete} color="red" />
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
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  tagsInput: {
    fontSize: 16,
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
  },
});

export default Thought; 
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import db from '@/firebase/firebaseConfig'; // Adjust the import based on your Firebase setup
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const NewThought: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const userId = GoogleSignin.getCurrentUser()?.user.id;

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem('draft');
        if (draft) {
          const { title, content, tags } = JSON.parse(draft);
          setTitle(title);
          setContent(content);
          setTags(tags);
        }
      } catch (error) {
        console.error("Error loading draft: ", error);
      }
    };

    loadDraft();
  }, []);

  // Save draft whenever title, content, or tags change
  useEffect(() => {
    const saveDraft = async () => {
      try {
        const draft = JSON.stringify({ title, content, tags });
        await AsyncStorage.setItem('draft', draft);
      } catch (error) {
        console.error("Error saving draft: ", error);
      }
    };

    saveDraft();
  }, [title, content, tags]);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (title && content) {
      try {
        await addDoc(collection(db, 'thoughts'), { title, content, userId, tags });
        await AsyncStorage.removeItem('draft'); // Clear draft after saving
        router.replace("/(tabs)/Thoughts");
        setTitle("");
        setContent("");
        setTags([]);
      } catch (error) {
        console.error("Error saving thought: ", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Thought</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Title" 
        value={title} 
        onChangeText={setTitle}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Content" 
        multiline 
        value={content} 
        onChangeText={setContent}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Add a tag" 
        value={tagInput} 
        onChangeText={setTagInput}
        onSubmitEditing={handleAddTag}
      />
      <View style={styles.tagContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text>{tag}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
              <Text style={styles.removeTag}>x</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <Button title="Save" onPress={handleSave} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    padding: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  removeTag: {
    marginLeft: 5,
    color: 'red',
  },
});

export default NewThought; 
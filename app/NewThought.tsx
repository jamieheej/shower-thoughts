import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import db from '@/firebase/firebaseConfig'; // Adjust the import based on your Firebase setup
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import Tag from '@/components/Tag';
import { useUser } from './(context)/UserContext';
import { getAuth } from 'firebase/auth';
export default function NewThoughtScreen() {
  const router = useRouter();
  const userId = getAuth().currentUser?.uid;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { theme } = useUser();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    input: {
      height: 40,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginVertical: 10,
    },
    contentInput: {
      height: 150,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingTop: 10,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
    },
    tag: {
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 8,
      marginRight: 6,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tagText: {
      color: '#4a5568',
      fontSize: 12,
      fontWeight: '500',
    },
    removeTagButton: {
      marginLeft: 4,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeTag: {
      color: '#4a5568',
      fontWeight: 'bold',
      fontSize: 12,
      lineHeight: 16,
    },
    saveButton: {
      backgroundColor: theme.buttonBackground,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    saveButtonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  
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
      setTags(prevTags => [...prevTags, tagInput]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (title && content) {
      try {
        if (!userId) {
          console.error("User not authenticated");
          // You might want to show an error message to the user
          return;
        }
        
        // Add timestamp and ensure userId is included
        const thoughtData = { 
          title, 
          content, 
          userId, 
          tags,
          createdAt: new Date(),
        };
        
        await addDoc(collection(db, 'thoughts'), thoughtData);
        await AsyncStorage.removeItem('draft'); // Clear draft after saving
        router.replace("/(tabs)/Thoughts");
        resetForm();
      } catch (error) {
        console.error("Error saving thought: ", error);
        // You might want to show an error message to the user
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput 
        style={[styles.input, { borderColor: theme.border }]} 
        placeholder="Title" 
        value={title} 
        onChangeText={setTitle}
        placeholderTextColor={theme.text}
      />
      <TextInput 
        style={[styles.contentInput, { borderColor: theme.border }]} 
        placeholder="Content" 
        multiline 
        numberOfLines={6}
        textAlignVertical="top"
        value={content} 
        onChangeText={setContent}
        placeholderTextColor={theme.text}
      />
      <TextInput 
        style={[styles.input, { borderColor: theme.border }]} 
        placeholder="Add a tag" 
        value={tagInput} 
        onChangeText={setTagInput}
        onSubmitEditing={handleAddTag}
        placeholderTextColor={theme.text}
      />
      <View style={[styles.tagContainer, { backgroundColor: theme.background }]}>
        {tags.map((tag, index) => (
          <Tag 
            key={index} 
            label={tag} 
            onRemove={() => handleRemoveTag(tag)} 
          />
        ))}
      </View>
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: theme.buttonBackground }]} 
        onPress={handleSave}
      >
        <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

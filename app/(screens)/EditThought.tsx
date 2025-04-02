import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import db from '@/firebase/firebaseConfig';
import { useUser } from '../(context)/UserContext';
import { getLocalThoughts, updateLocalThought } from '@/utils/localStorageService';
import Tag from '@/components/Tag';
import { Ionicons } from '@expo/vector-icons';

export default function EditThoughtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userInfo, isGuestMode, theme } = useUser();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [favorite, setFavorite] = useState(false);

  // Add refs for your TextInputs
  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);
  const tagInputRef = useRef<TextInput>(null);

  // Load thought data
  useEffect(() => {
    const fetchThought = async () => {
      try {
        if (!id) {
          Alert.alert('Error', 'No thought ID provided');
          router.back();
          return;
        }

        if (isGuestMode) {
          // Fetch from local storage for guest mode
          const localThoughts = await getLocalThoughts();
          const thought = localThoughts.find(t => t.id === id);
          
          if (thought) {
            setTitle(thought.title);
            setContent(thought.content);
            setTags(thought.tags || []);
            setFavorite(thought.favorite || false);
          } else {
            Alert.alert('Error', 'Thought not found');
            router.back();
          }
        } else {
          // Fetch from Firestore for authenticated users
          const thoughtRef = doc(db, 'thoughts', id as string);
          const thoughtSnap = await getDoc(thoughtRef);
          
          if (thoughtSnap.exists()) {
            const thoughtData = thoughtSnap.data();
            setTitle(thoughtData.title);
            setContent(thoughtData.content);
            setTags(thoughtData.tags || []);
            setFavorite(thoughtData.favorite || false);
          } else {
            Alert.alert('Error', 'Thought not found');
            router.back();
          }
        }
      } catch (error) {
        console.error('Error fetching thought:', error);
        Alert.alert('Error', 'Failed to load thought');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchThought();
  }, [id, isGuestMode, router]);

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
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }

    setSaving(true);
    
    try {
      const updatedThought = {
        id: id as string,
        title,
        content,
        tags,
        favorite,
        // Keep the original date and userId
        date: new Date().toISOString(), // You might want to keep the original date instead
        userId: isGuestMode ? 'guest' : userInfo?.id || '',
      };
      
      if (isGuestMode) {
        // Update in local storage
        await updateLocalThought(updatedThought);
      } else {
        // Update in Firestore
        const thoughtRef = doc(db, 'thoughts', id as string);
        await updateDoc(thoughtRef, {
          title,
          content,
          tags,
          favorite,
          // Don't update date or userId
        });
      }
      
      router.navigate('/(tabs)/Thoughts');
    } catch (error) {
      console.error('Error updating thought:', error);
      Alert.alert('Error', 'Failed to update thought');
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Thought</Text>
        
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Ionicons 
            name={favorite ? "heart" : "heart-outline"} 
            size={24} 
            color={theme.text} 
          />
        </TouchableOpacity>
      </View>
      
      <TextInput 
        ref={titleInputRef}
        style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
        placeholder="Title" 
        value={title} 
        onChangeText={setTitle}
        placeholderTextColor={theme.textSecondary}
      />
      
      <TextInput 
        ref={contentInputRef}
        style={[styles.contentInput, { borderColor: theme.border, color: theme.text }]} 
        placeholder="Content" 
        multiline 
        numberOfLines={6}
        textAlignVertical="top"
        value={content} 
        onChangeText={setContent}
        placeholderTextColor={theme.textSecondary}
      />
      
      <TextInput 
        ref={tagInputRef}
        style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
        placeholder="Add a tag" 
        value={tagInput} 
        onChangeText={setTagInput}
        onSubmitEditing={handleAddTag}
        placeholderTextColor={theme.textSecondary}
      />
      
      <View style={styles.tagContainer}>
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
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={theme.buttonText} />
        ) : (
          <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  favoriteButton: {
    padding: 8,
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
    marginVertical: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
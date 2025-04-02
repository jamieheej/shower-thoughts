import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig';
import { useUser } from '../(context)/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { getLocalThoughts, updateLocalThought, deleteLocalThought } from '@/utils/localStorageService';
import { formatDate } from '@/utils/dateUtils';

type Thought = {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  userId: string;
  favorite?: boolean;
};

export default function ThoughtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isGuestMode, theme, userInfo } = useUser();
  const [thought, setThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThought = async () => {
      try {
        if (isGuestMode) {
          // Fetch from local storage for guest mode
          const localThoughts = await getLocalThoughts();
          const foundThought = localThoughts.find(t => t.id === id);
          if (foundThought) {
            setThought(foundThought);
          }
        } else {
          // Fetch from Firestore for authenticated users
          const thoughtRef = doc(db, 'thoughts', id as string);
          const thoughtSnap = await getDoc(thoughtRef);
          
          if (thoughtSnap.exists()) {
            setThought({ id: thoughtSnap.id, ...thoughtSnap.data() } as Thought);
          }
        }
      } catch (error) {
        console.error('Error fetching thought:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchThought();
    }
  }, [id, isGuestMode]);

  const handleDelete = async () => {
    Alert.alert(
      "Delete Thought",
      "Are you sure you want to delete this thought?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              if (isGuestMode) {
                // Delete from local storage
                await deleteLocalThought(id as string);
              } else {
                // Delete from Firestore
                await deleteDoc(doc(db, 'thoughts', id as string));
              }
              router.back();
            } catch (error) {
              console.error('Error deleting thought:', error);
              Alert.alert('Error', 'Failed to delete thought');
            }
          }
        }
      ]
    );
  };

  const handleToggleFavorite = async () => {
    if (!thought) return;
    
    const updatedThought = { ...thought, favorite: !thought.favorite };
    
    try {
      if (isGuestMode) {
        // Update in local storage
        await updateLocalThought(updatedThought);
      } else {
        // Update in Firestore
        const thoughtRef = doc(db, 'thoughts', id as string);
        await updateDoc(thoughtRef, { favorite: !thought.favorite });
      }
      
      // Update local state
      setThought(updatedThought);
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (!thought) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Thought not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.link }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleToggleFavorite}
            style={styles.actionButton}
          >
            <Ionicons 
              name={thought.favorite ? "heart" : "heart-outline"} 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push(`/(screens)/EditThought?id=${thought.id}`)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleDelete}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{thought.title}</Text>
        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {formatDate(thought.date)}
        </Text>
        
        <Text style={[styles.thoughtContent, { color: theme.text }]}>
          {thought.content}
        </Text>
        
        {thought.tags && thought.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {thought.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.tagBackground }]}>
                <Text style={[styles.tagText, { color: theme.tagText }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
  },
  backButton: {
    padding: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 16,
  },
  thoughtContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  tag: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
}); 
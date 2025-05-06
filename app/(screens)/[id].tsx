import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import db from '@/firebase/firebaseConfig';
import { useUser } from '../(context)/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { getLocalThoughts, updateLocalThought, deleteLocalThought } from '@/utils/localStorageService';
import { formatDate } from '@/utils/dateUtils';
import { shareThought } from '@/utils/shareUtils';
import { getPublicThoughts } from '@/utils/localStorageService';

type Thought = {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  userId: string;
  favorite?: boolean;
  public?: boolean;
};

export default function ThoughtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isGuestMode, theme, userInfo } = useUser();
  const [thought, setThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);


const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 10,
    },
    headerActions: {
      flexDirection: 'row',
    },
    backButton: {
      padding: 0,
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
    publicToggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    publicToggleText: {
      fontSize: 16,
    },
  });

  useEffect(() => {
    const fetchThought = async () => {
      setLoading(true);
      try {
        if (!id) {
          setError('No thought ID provided');
          return;
        }

        let fetchedThought = null;

        if (isGuestMode) {
          // First try to find in local thoughts
          const localThoughts = await getLocalThoughts();
          const foundThought = localThoughts.find(t => t.id === id);
          
          if (foundThought) {
            fetchedThought = foundThought;
          } else {
            // If not found in local thoughts, check sample public thoughts
            const publicThoughts = await getPublicThoughts();
            const publicThought = publicThoughts.find(t => t.id === id);
            
            if (publicThought) {
              fetchedThought = publicThought;
            } else {
              setError('Thought not found');
            }
          }
        } else {
          // For authenticated users, fetch from Firestore
          const thoughtRef = doc(db, 'thoughts', id as string);
          const thoughtSnap = await getDoc(thoughtRef);
          
          if (thoughtSnap.exists()) {
            const thoughtData = thoughtSnap.data();
            fetchedThought = { id: thoughtSnap.id, ...thoughtData } as Thought;
          } else {
            // If not found in user's thoughts, try public thoughts
            const publicThoughtsRef = collection(db, 'thoughts');
            const q = query(publicThoughtsRef, where('public', '==', true), where('id', '==', id));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const publicThoughtData = querySnapshot.docs[0].data();
              fetchedThought = { id: querySnapshot.docs[0].id, ...publicThoughtData } as Thought;
            } else {
              setError('Thought not found');
            }
          }
        }

        if (fetchedThought) {
          setThought(fetchedThought);
          setIsPublic(fetchedThought.public || false);
          
          // Determine ownership
          if (isGuestMode) {
            setIsOwner(fetchedThought.userId === 'guest');
          } else {
            setIsOwner(fetchedThought.userId === userInfo?.id);
          }
        }
      } catch (error) {
        console.error('Error fetching thought:', error);
        setError('Failed to load thought');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchThought();
    }
  }, [id, isGuestMode, userInfo?.id]);

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

  const handleTogglePublic = async () => {
    if (!thought) return;
    
    const newPublicState = !isPublic;
    const updatedThought = { ...thought, public: newPublicState };
    
    try {
      if (isGuestMode) {
        // Update in local storage
        await updateLocalThought(updatedThought);
      } else {
        // Update in Firestore
        const thoughtRef = doc(db, 'thoughts', id as string);
        await updateDoc(thoughtRef, { public: newPublicState });
      }
      
      // Update local state
      setIsPublic(newPublicState);
      setThought(updatedThought); // Also update the thought object
    } catch (error) {
      console.error('Error updating public status:', error);
    }
  };

  return loading ? (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.text} />
    </SafeAreaView>
  ) : !thought ? (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
    </SafeAreaView>
  ) : (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
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
              onPress={() => shareThought(thought)}
              style={styles.actionButton}
            >
              <Ionicons name="share-outline" size={24} color={theme.text} />
            </TouchableOpacity>
            
            {isOwner && (
              <>
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
              </>
            )}
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
        
        {isOwner && (
          <View style={styles.publicToggleContainer}>
            <Text style={[styles.publicToggleText, { color: theme.text }]}>
              Make this thought public
            </Text>
            <Switch
              value={isPublic}
              onValueChange={handleTogglePublic}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isPublic ? theme.buttonText : theme.background}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import db from '@/firebase/firebaseConfig'; // Adjust the import based on your Firebase setup
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const NewThought: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const userId = GoogleSignin.getCurrentUser()?.user.id;

  const handleSave = async () => {
    if (title && content) {
      try {
        await addDoc(collection(db, 'thoughts'), { title, content, userId }); 
        router.replace("/(tabs)/Thoughts");
        setTitle("")
        setContent("")
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
        onChangeText={setTitle} // Update title state
      />
      <TextInput 
        style={styles.input} 
        placeholder="Content" 
        multiline 
        value={content} 
        onChangeText={setContent} // Update content state
      />
      <Button title="Save" onPress={handleSave} /> {/* Call handleSave on press */}
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
});

export default NewThought; 
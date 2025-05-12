import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as FileSystem from "expo-file-system";
import { initializeApp } from "firebase/app";
import firebaseConfig from "@/firebase/firebaseConfig";

// Initialize Firebase if not already initialized
// const app = initializeApp(firebaseConfig);

export const uploadAudioToFirebase = async (
  localUri: string,
  userId: string
): Promise<string> => {
  try {
    // Create a blob from the file
    const response = await fetch(localUri);
    const blob = await response.blob();

    // Generate a unique filename
    const filename = `audio_${userId}_${Date.now()}.m4a`;

    // Get a reference to Firebase Storage
    const storage = getStorage();

    // Create a full path for the file
    const fullPath = `audio/${userId}/${filename}`;

    // Create a reference with an initial file path and name
    const storageRef = ref(storage, fullPath);

    console.log("Uploading to path:", fullPath);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, blob);
    console.log("Upload successful:", snapshot);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading audio to Firebase:", error);

    // For debugging
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Return the local URI as fallback
    return localUri;
  }
};

export const deleteAudioFromFirebase = async (
  audioUrl: string
): Promise<void> => {
  try {
    // Extract the path from the URL
    const storage = getStorage();
    const audioRef = ref(storage, audioUrl);

    // Delete the file
    await deleteObject(audioRef);
  } catch (error) {
    console.error("Error deleting audio from Firebase:", error);
    throw error;
  }
};

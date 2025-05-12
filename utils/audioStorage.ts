import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as FileSystem from "expo-file-system";

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
    const storageRef = ref(storage, `audio/${userId}/${filename}`);

    // Upload the file
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading audio to Firebase:", error);
    throw error;
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

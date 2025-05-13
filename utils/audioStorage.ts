import { storage } from "@/firebase/firebaseConfig";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

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

    if (!storage) {
      console.error("Firebase Storage not initialized");
      return localUri; // Return local URI as fallback
    }

    // Create a full path for the file
    const fullPath = `audio/${userId}/${filename}`;
    console.log("Creating storage reference with path:", fullPath);

    // Create a reference with an initial file path and name
    const storageRef = ref(storage, fullPath);
    console.log("Storage reference created:", storageRef);

    // Upload the file
    console.log("Starting upload...");
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
    // Check if this is a Firebase URL or local URI
    if (!audioUrl.startsWith("http")) {
      console.log("Not a Firebase URL, skipping delete");
      return;
    }

    // Get a reference to Firebase Storage
    const storage = getStorage();

    if (!storage) {
      console.error("Firebase Storage not initialized");
      return;
    }

    // Extract the path from the URL
    // This is a simplified approach - you might need to parse the URL more carefully
    const path = audioUrl.split("?")[0].split("/o/")[1];
    if (!path) {
      console.error("Could not extract path from URL:", audioUrl);
      return;
    }

    const decodedPath = decodeURIComponent(path);
    console.log("Deleting file at path:", decodedPath);

    const audioRef = ref(storage, decodedPath);

    // Delete the file
    await deleteObject(audioRef);
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Error deleting audio from Firebase:", error);
    // Don't throw the error, just log it
  }
};

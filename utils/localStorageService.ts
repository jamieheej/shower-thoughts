import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalThought = {
  id: string;
  title: string;
  content: string;
  date: string;
  userId: string;
  tags: string[];
  favorite?: boolean;
  public?: boolean;
};

const THOUGHTS_STORAGE_KEY = "local_thoughts";

export const saveLocalThought = async (
  thought: LocalThought
): Promise<void> => {
  try {
    const existingThoughts = await getLocalThoughts();
    const updatedThoughts = [...existingThoughts, thought];
    await AsyncStorage.setItem(
      THOUGHTS_STORAGE_KEY,
      JSON.stringify(updatedThoughts)
    );
  } catch (error) {
    console.error("Error saving local thought:", error);
    throw error;
  }
};

export const saveLocalThoughts = async (
  thoughts: LocalThought[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(THOUGHTS_STORAGE_KEY, JSON.stringify(thoughts));
  } catch (error) {
    console.error("Error saving local thoughts:", error);
    throw error;
  }
};

export const getLocalThoughts = async (): Promise<LocalThought[]> => {
  try {
    const thoughts = await AsyncStorage.getItem(THOUGHTS_STORAGE_KEY);
    return thoughts ? JSON.parse(thoughts) : [];
  } catch (error) {
    console.error("Error getting local thoughts:", error);
    return [];
  }
};

export const deleteLocalThought = async (thoughtId: string): Promise<void> => {
  try {
    const thoughts = await getLocalThoughts();
    const updatedThoughts = thoughts.filter(
      (thought) => thought.id !== thoughtId
    );
    await AsyncStorage.setItem(
      THOUGHTS_STORAGE_KEY,
      JSON.stringify(updatedThoughts)
    );
  } catch (error) {
    console.error("Error deleting local thought:", error);
    throw error;
  }
};

export const updateLocalThought = async (
  updatedThought: LocalThought
): Promise<void> => {
  try {
    const thoughts = await getLocalThoughts();
    const updatedThoughts = thoughts.map((thought) =>
      thought.id === updatedThought.id ? updatedThought : thought
    );
    await AsyncStorage.setItem(
      THOUGHTS_STORAGE_KEY,
      JSON.stringify(updatedThoughts)
    );
  } catch (error) {
    console.error("Error updating local thought:", error);
    throw error;
  }
};

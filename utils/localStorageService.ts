import AsyncStorage from "@react-native-async-storage/async-storage";

export type LocalThought = {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
};

export const saveLocalThought = async (
  thought: LocalThought
): Promise<void> => {
  try {
    // Get existing thoughts
    const existingThoughtsJSON = await AsyncStorage.getItem("localThoughts");
    const existingThoughts: LocalThought[] = existingThoughtsJSON
      ? JSON.parse(existingThoughtsJSON)
      : [];

    // Add new thought
    existingThoughts.push(thought);

    // Save back to storage
    await AsyncStorage.setItem(
      "localThoughts",
      JSON.stringify(existingThoughts)
    );
  } catch (error) {
    console.error("Error saving local thought:", error);
    throw error;
  }
};

export const getLocalThoughts = async (): Promise<LocalThought[]> => {
  try {
    const thoughtsJSON = await AsyncStorage.getItem("localThoughts");
    return thoughtsJSON ? JSON.parse(thoughtsJSON) : [];
  } catch (error) {
    console.error("Error getting local thoughts:", error);
    return [];
  }
};

export const updateLocalThought = async (
  updatedThought: LocalThought
): Promise<void> => {
  try {
    const existingThoughtsJSON = await AsyncStorage.getItem("localThoughts");
    const existingThoughts: LocalThought[] = existingThoughtsJSON
      ? JSON.parse(existingThoughtsJSON)
      : [];

    // Check if the thought exists before updating
    const thoughtExists = existingThoughts.some(
      (thought) => thought.id === updatedThought.id
    );
    if (!thoughtExists) {
      console.error(`Thought with ID ${updatedThought.id} not found`);
      throw new Error(`Thought with ID ${updatedThought.id} not found`);
    }

    const updatedThoughts = existingThoughts.map((thought) =>
      thought.id === updatedThought.id ? updatedThought : thought
    );

    await AsyncStorage.setItem(
      "localThoughts",
      JSON.stringify(updatedThoughts)
    );
  } catch (error) {
    console.error("Error updating local thought:", error);
    throw error;
  }
};

export const deleteLocalThought = async (thoughtId: string): Promise<void> => {
  try {
    const existingThoughtsJSON = await AsyncStorage.getItem("localThoughts");
    const existingThoughts: LocalThought[] = existingThoughtsJSON
      ? JSON.parse(existingThoughtsJSON)
      : [];

    const updatedThoughts = existingThoughts.filter(
      (thought) => thought.id !== thoughtId
    );

    await AsyncStorage.setItem(
      "localThoughts",
      JSON.stringify(updatedThoughts)
    );
  } catch (error) {
    console.error("Error deleting local thought:", error);
    throw error;
  }
};

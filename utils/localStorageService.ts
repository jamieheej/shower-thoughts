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

export const samplePublicThoughts = [
  {
    id: "public-1",
    title: "The Universe is Vast",
    content:
      "If the universe is infinite, then somewhere there must be a planet exactly like Earth with someone exactly like you reading this exact thought.",
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    tags: ["universe", "philosophy"],
    favorite: false,
    userId: "public-user-1",
  },
  {
    id: "public-2",
    title: "Shower Paradox",
    content:
      "The dirtier you are, the cleaner the shower water makes you, but the cleaner you get, the dirtier the shower water becomes.",
    date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    tags: ["shower", "paradox"],
    favorite: false,
    userId: "public-user-2",
  },
  {
    id: "public-3",
    title: "Language Evolution",
    content:
      "Every word in every language was made up by someone at some point in history.",
    date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    tags: ["language", "history"],
    favorite: false,
    userId: "public-user-3",
  },
  {
    id: "public-4",
    title: "Digital Memories",
    content:
      "Future generations will have their entire lives documented in photos and videos, unlike any generation before them.",
    date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    tags: ["technology", "future"],
    favorite: false,
    userId: "public-user-4",
  },
  {
    id: "public-5",
    title: "Ocean Perspective",
    content:
      "The ocean is both a barrier and a connection between continents, depending on your technological capabilities.",
    date: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
    tags: ["ocean", "perspective"],
    favorite: false,
    userId: "public-user-5",
  },
];

export const getPublicThoughts = async (): Promise<LocalThought[]> => {
  try {
    const thoughts = await getLocalThoughts();
    const publicThoughts = thoughts.filter((t) => t.public === true);

    if (publicThoughts.length > 0) {
      return publicThoughts;
    }

    return samplePublicThoughts;
  } catch (error) {
    console.error("Error getting public thoughts:", error);
    return samplePublicThoughts;
  }
};

import { Share, Alert } from "react-native";

/**
 * Type definition for shareable thought content
 */
export type ShareableThought = {
  title: string;
  content: string;
  tags: string[];
};

/**
 * Shares a thought using the native share dialog
 * @param thought The thought to share
 * @returns Promise that resolves when sharing is complete
 */
export const shareThought = async (
  thought: ShareableThought
): Promise<void> => {
  try {
    // Format tags if they exist
    const tagsText =
      thought.tags && thought.tags.length > 0
        ? `\n\n${thought.tags.join(", ")}`
        : "";

    // Format the content for sharing
    const shareContent = {
      title: "Check out this thought from ShowerThoughts",
      message: `"${thought.title}"\n${thought.content}${tagsText}\n\nfrom ShowerThoughts`,
    };

    const result = await Share.share(shareContent);

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // Shared with activity type of result.activityType
        console.log(`Shared via ${result.activityType}`);
      } else {
        // Shared
        console.log("Shared successfully");
      }
    } else if (result.action === Share.dismissedAction) {
      // Dismissed
      console.log("Share dismissed");
    }
  } catch (error) {
    Alert.alert("Error", "Something went wrong sharing this thought");
    console.error("Error sharing:", error);
  }
};

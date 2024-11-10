import { StyleSheet, Dimensions, View, StyleProp, ViewStyle } from 'react-native';
import Video from 'react-native-video';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';

enableScreens();

type HomeScreenNavigationProp = NavigationProp<{
  Thoughts: undefined;
}>;

const VideoBackground = ({ style }: { style: StyleProp<ViewStyle> }) => (
  <Video
    source={require('@/assets/videos/background.mp4')}
    style={style}
    resizeMode="cover"
    repeat
    muted
  />
);

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const styles = StyleSheet.create({
    backgroundVideo: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width,
      height,
      flex: 1
    },
    themedView: {
      backgroundColor: "transparent", 
      height: height, 
      width: width - 32,
      padding: 16,
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "flex-end", 
      alignItems: "flex-start",
      gap: 16
    },
    button: {
      backgroundColor: "black"
    },
    textContainer: {
      gap: 8
    }
  });

  const handleButtonPress = () => {
    navigation.navigate('Thoughts');
  };

  return (
    <View>
      <VideoBackground style={styles.backgroundVideo} />
      <ThemedView style={styles.themedView}>
        <View style={styles.textContainer}>
          <ThemedText type="title">ShowerThoughts</ThemedText>
          <ThemedText>
            Capture your creative ideas anywhere, anytime.
          </ThemedText>
        </View>
        <Button mode="contained" onPress={handleButtonPress} style={styles.button}>
          Get started
        </Button>
      </ThemedView>
    </View>
  );
}



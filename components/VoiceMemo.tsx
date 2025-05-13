import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useUser } from '@/app/(context)/UserContext';

// Add this helper function at the top
const generateRandomHeights = (count: number, maxHeight: number, minHeight: number = 5) => {
  return Array.from({ length: count }).map(() => 
    Math.random() * (maxHeight - minHeight) + minHeight
  );
};

type VoiceMemoProps = {
  audioUri?: string;
  onAudioRecorded: (uri: string) => void;
  onAudioDeleted: () => void;
  readOnly?: boolean;
};

export default function VoiceMemo({ audioUri, onAudioRecorded, onAudioDeleted, readOnly = false }: VoiceMemoProps) {
  const { theme } = useUser();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Animation related state
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);
  const [animationActive, setAnimationActive] = useState(false);
  
  const BARS_COUNT = 30;
  const MAX_HEIGHT = 40;
  const MIN_HEIGHT = 5;
  const ANIMATION_INTERVAL = 100; // ms

  // Initialize waveform heights
  useEffect(() => {
    setWaveformHeights(generateRandomHeights(BARS_COUNT, MAX_HEIGHT, MIN_HEIGHT));
  }, []);

  // Handle animation for waveform
  useEffect(() => {
    if ((isRecording && !isPaused) || isPlaying) {
      setAnimationActive(true);
      
      // Start animation loop
      animationRef.current = setInterval(() => {
        setWaveformHeights(generateRandomHeights(BARS_COUNT, MAX_HEIGHT, MIN_HEIGHT));
      }, ANIMATION_INTERVAL);
    } else {
      setAnimationActive(false);
      
      // Clear animation loop
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isRecording, isPaused, isPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recording, sound]);

  // Load sound if audioUri is provided
  useEffect(() => {
    if (audioUri) {
      loadSound(audioUri);
    }
  }, [audioUri]);

  const loadSound = async (uri: string) => {
    setLoading(true);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error loading sound:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setPosition(0);
      }
    }
  };

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Permission to record audio is required!');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.pauseAsync();
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  };

  const resumeRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.startAsync();
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      
      if (uri) {
        onAudioRecorded(uri);
        await loadSound(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const playSound = async () => {
    if (!sound) return;
    
    try {
      await sound.playFromPositionAsync(position);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const pauseSound = async () => {
    if (!sound) return;
    
    try {
      await sound.pauseAsync();
    } catch (error) {
      console.error('Failed to pause sound:', error);
    }
  };

  const deleteRecording = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      if (audioUri) {
        if (audioUri.startsWith('http')) {
          // Skip deleting remote files here - that's handled by the parent component
        } else {
          // Delete local file
          try {
            await FileSystem.deleteAsync(audioUri);
          } catch (error) {
            console.log('File may not exist locally:', error);
          }
        }
      }
      
      onAudioDeleted();
      setPosition(0);
      setDuration(0);
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderWaveform = () => {
    return (
      <View style={styles.waveformContainer}>
        {waveformHeights.map((height, index) => (
          <View 
            key={index}
            style={[
              styles.waveformBar,
              { 
                height, 
                backgroundColor: animationActive
                  ? theme.primary 
                  : theme.textSecondary 
              }
            ]}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { borderColor: theme.border }]}>
        <ActivityIndicator size="small" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      {/* Waveform visualization */}
      {(isRecording || sound) && renderWaveform()}
      
      {/* Recording controls */}
      <View style={styles.controls}>
        {!readOnly && !sound && !isRecording && (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]} 
            onPress={startRecording}
          >
            <Ionicons name="mic" size={20} color="white" />
            <Text style={styles.buttonText}>Start Recording</Text>
          </TouchableOpacity>
        )}
        
        {!readOnly && isRecording && (
          <View style={styles.recordingControls}>
            {isPaused ? (
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: theme.primary }]} 
                onPress={resumeRecording}
              >
                <Ionicons name="play" size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: theme.primary }]} 
                onPress={pauseRecording}
              >
                <Ionicons name="pause" size={20} color="white" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: theme.error }]} 
              onPress={stopRecording}
            >
              <Ionicons name="stop" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Playback controls */}
        {sound && (
          <View style={styles.playbackControls}>
            {isPlaying ? (
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: theme.primary }]} 
                onPress={pauseSound}
              >
                <Ionicons name="pause" size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: theme.primary }]} 
                onPress={playSound}
              >
                <Ionicons name="play" size={20} color="white" />
              </TouchableOpacity>
            )}
            
            <Text style={[styles.timeText, { color: theme.text }]}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
            
            {!readOnly && (
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: theme.error }]} 
                onPress={deleteRecording}
              >
                <Ionicons name="trash" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
  waveformContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  waveformBar: {
    width: 3,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 14,
  },
}); 
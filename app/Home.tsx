import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { collection, setDoc, doc, addDoc } from "firebase/firestore";
import db, { auth } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { useUser } from "./(context)/UserContext";
import { Video, ResizeMode, Audio } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';
import { getAuth, signInWithCredential, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 20,
  },
  button: {
    height: 44,
    width: 200,
    marginBottom: 20,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  appleButton: {
    height: 44,
    width: 200,
    marginBottom: 20,
    borderRadius: 50,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  googleButton: {
    height: 44,
    width: 200,
    marginBottom: 20,
    backgroundColor: "black",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    color: "white",
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  googleText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  guestButton: {
    height: 44,
    width: 200,
    marginTop: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  guestButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});

type UserData = {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
  loginMethod: "apple" | "google" | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const { userInfo, setUserInfo, handleLogout, enableGuestMode, isGuestMode, disableGuestMode } = useUser();

  useEffect(() => {
    GoogleSignin.configure();
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
    });
  }, []);

  const handleAppleLogin = async () => {
    try {
      // Clear guest mode first if active
      if (isGuestMode) {
        await AsyncStorage.removeItem('isGuestMode');
        disableGuestMode();
      }
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      // Create a Firebase credential from the Apple credential
      const provider = new OAuthProvider('apple.com');
      const authCredential = provider.credential({
        idToken: credential.identityToken || '',
        rawNonce: credential.state || '',
      });
      
      // Sign in to Firebase with the credential
      const userCredential = await signInWithCredential(auth, authCredential);
      const firebaseUser = userCredential.user;
      
      // Create user data
      const userData = {
        id: firebaseUser.uid,
        name: credential.fullName?.givenName || firebaseUser.displayName || '',
        email: credential.email || firebaseUser.email || '',
        photo: firebaseUser.photoURL,
        familyName: credential.fullName?.familyName || null,
        givenName: credential.fullName?.givenName || null,
        loginMethod: "apple",
      };
      
      // Set user info
      setUserInfo(userData);
      
      // Save user data to Firestore
      await setDoc(doc(collection(db, "users"), firebaseUser.uid), userData, { merge: true });
      
      // Navigate to Thoughts
      router.replace('/(tabs)/Thoughts');
      
      // Create a test thought
      // await createTestThought(firebaseUser.uid);
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      const auth = getAuth();
      const googleCredential = GoogleAuthProvider.credential(response.data?.idToken);
      await signInWithCredential(auth, googleCredential);
    
      if (response.data?.user) {
        const userData = response.data.user as UserData;
        userData.loginMethod = "google";
        await saveUserData(userData);
        router.push('/(tabs)/Thoughts');
        
        // Add this after successful login
        await createTestThought(userData.id);
      }
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const createUserData = (credential: any, method: "apple" | "google"): UserData => ({
    id: credential.user,
    name: credential.fullName?.givenName ?? '',
    email: credential.email ?? '',
    photo: null,
    familyName: credential.fullName?.familyName ?? null,
    givenName: credential.fullName?.givenName ?? null,
    loginMethod: method,
  });

  const saveUserData = async (userData: UserData) => {
    try {
      // Get the current Firebase user
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // User is already authenticated, save data
        await setDoc(doc(collection(db, "users"), currentUser.uid), {
          ...userData,
          id: currentUser.uid
        }, { merge: true });
        console.log("User data saved successfully");
        
        // Call this in your saveUserData function when a user is created
        if (currentUser && !userInfo) {
          await createTestThought(currentUser.uid);
        }
      } else {
        // No user yet, set up a listener with a shorter timeout
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.log("Auth timeout, but continuing anyway");
            resolve(false); // Resolve instead of reject to prevent errors
          }, 3000);
          
          const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
              clearTimeout(timeout);
              try {
                await setDoc(doc(collection(db, "users"), user.uid), {
                  ...userData,
                  id: user.uid
                }, { merge: true });
                console.log("User data saved successfully");
                
                // Call this in your saveUserData function when a user is created
                if (user && !userInfo) {
                  await createTestThought(user.uid);
                }
                resolve(true);
              } catch (error) {
                console.error("Error saving user data:", error);
                resolve(false); // Resolve instead of reject
              } finally {
                unsubscribe();
              }
            }
          });
        });
      }
    } catch (error) {
      console.error("Error in saveUserData:", error);
      // Don't throw, just log
      return false;
    }
  };

  const handleAuthError = (error: any) => {
    console.error(error);
    if (error.code === "ERR_REQUEST_CANCELED") {
      // Handle user cancellation
    } else if (error.code === statusCodes.IN_PROGRESS) {
     console.log("Sign in is in progress");
    } else {
      console.log(error);
    }
  };

  const handleGuestMode = async () => {
    enableGuestMode();
    
    await AsyncStorage.setItem('isGuestMode', 'true');
    
    // Force a refresh of the app by resetting the navigation state
    router.replace('/');
  };

  return (
    <>
      <Video
        source={require('@/assets/shower-bg.mp4')}
        style={styles.background}
        shouldPlay
        isLooping
        resizeMode={ResizeMode.COVER}
        isMuted={true}
      />
      <View style={styles.container}>
        <Text style={styles.appName}>ShowerThoughts</Text>
        <Text style={styles.appDescription}>A place for your thoughts to flow.</Text>
        {userInfo ? (
          <>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={{ color: 'white' }}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={50}
              style={styles.appleButton}
              onPress={handleAppleLogin}
            />
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <AntDesign name="google" size={18} color="white" style={styles.googleIcon} />
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode}>
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );
};

const createTestThought = async (userId: string) => {
  try {
    const thoughtsRef = collection(db, 'thoughts');
    await addDoc(thoughtsRef, {
      title: "Welcome to ShowerThoughts!",
      content: "This is your first thought. Tap the + button to add more.",
      date: new Date().toISOString(),
      userId: userId,
      tags: ["welcome"],
      favorite: false
    });
  } catch (error) {
    // Remove: console.error("Error creating test thought:", error);
  }
};

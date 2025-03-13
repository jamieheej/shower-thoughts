import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { collection, setDoc, doc } from "firebase/firestore";
import db from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { useUser } from "./(context)/UserContext";
import { Video, ResizeMode } from 'expo-av';
import { AntDesign } from '@expo/vector-icons';

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
  const { userInfo, setUserInfo, handleLogout } = useUser();

  useEffect(() => {
    GoogleSignin.configure();
  }, []);

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const userData = createUserData(credential, "apple");
      await saveUserData(userData);
      router.push('/(tabs)/Thoughts');
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const userData = response.data?.user as UserData;
      if (userData) {
        userData.loginMethod = "google";
        await saveUserData(userData);
        router.push('/(tabs)/Thoughts');
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
    setUserInfo(userData);
    await setDoc(doc(collection(db, "users"), userData.id), userData, { merge: true });
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

  const userName = userInfo?.name ?? "Guest";

  return (
    <>
      <Video
        source={require('@/assets/shower-bg.mp4')}
        style={styles.background}
        shouldPlay
        isLooping
        resizeMode={ResizeMode.COVER}
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
          </>
        )}
      </View>
    </>
  );
};

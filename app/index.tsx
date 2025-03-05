import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { collection, setDoc, doc } from "firebase/firestore";
import db from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { useUser } from "./(context)/UserContext";
import { Video, ResizeMode } from 'expo-av';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 20,
  },
  button: {
    height: 44,
    marginBottom: 20,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
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

const HomeScreen = () => {
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
      router.push('/Thoughts');
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
        router.push('/Thoughts');
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
            <Text>Welcome, {userName}</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={{ color: 'white' }}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={5}
              style={styles.button}
              onPress={handleAppleLogin}
            />
            <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
              <Text style={{ color: 'white' }}>Login with Google</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );
};

export default HomeScreen;

import React, { useEffect, useState } from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import {
  GoogleSignin,
  statusCodes,
  type User,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { collection, setDoc, doc } from "firebase/firestore";
import db from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { useUser } from "./(context)/UserContext";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: 44,
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
      const userData = {
        id: credential.user,
        name: credential.fullName?.givenName ?? '',
        email: credential.email ?? '',
        photo: null,
        familyName: credential.fullName?.familyName ?? null,
        givenName: credential.fullName?.givenName ?? null,
        loginMethod: "apple",
      };
      setUserInfo(userData);
      await setDoc(doc(collection(db, "users"), userData.id), userData, { merge: true });
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
        setUserInfo(userData);
        await setDoc(doc(collection(db, "users"), userData.id), userData, { merge: true });
        router.push('/Thoughts');
      }
    } catch (error: any) {
      handleAuthError(error);
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

  const userName = userInfo?.name ?? "Guest";
  console.log(userInfo)

  return (
    <View style={styles.container}>
      <Text>Welcome to the App</Text>
      {userInfo ? (
        <>
          <Text>Welcome, {userName}</Text>
          <Button title="Logout" onPress={handleLogout} />
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
          <Button title="Login with Google" onPress={handleGoogleLogin} />
        </>
      )}
    </View>
  );
};

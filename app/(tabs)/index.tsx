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

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<User["user"] | null>(null);
  const [loginMethod, setLoginMethod] = useState<"apple" | "google" | null>(null);

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
      };
      setUserInfo(userData);
      setLoginMethod("apple");
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
      const userData = response.data?.user ?? null;
      if (userData) {
        setUserInfo(userData);
        setLoginMethod("google");
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

  const handleLogout = async () => {
    if (loginMethod === "apple") {
      await handleAppleLogout();
    } else if (loginMethod === "google") {
      await handleGoogleLogout();
    }
    setLoginMethod(null);
  };

  const handleAppleLogout = async () => {
    setUserInfo(null);
    console.log("User signed out from Apple");
  };

  const handleGoogleLogout = async () => {
    await GoogleSignin.signOut();
    setUserInfo(null);
    console.log("User signed out from Google");
  };

  const userName = userInfo?.name ?? "Guest";

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

export default LoginScreen;

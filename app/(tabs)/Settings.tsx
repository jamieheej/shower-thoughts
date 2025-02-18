import React from "react";
import { View, Text, Button } from "react-native";
import { useUser } from "../(context)/UserContext";
import { useRouter } from "expo-router";

const SettingsScreen = () => {
  const { userInfo, handleLogout } = useUser();
  const router = useRouter();
  console.log(userInfo);

  const handleThemeChange = () => {};

  return (
    <View>
      <Text>Settings</Text>
      <Button
        title="Logout"
        onPress={() => {
          handleLogout();
          router.dismissAll();
        }}
      />
      <Button title="Change Theme" onPress={handleThemeChange} />
    </View>
  );
};

export default SettingsScreen;

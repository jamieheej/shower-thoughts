import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "../(context)/UserContext";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const router = useRouter();
  const { handleLogout, toggleTheme, theme } = useUser();

  const handleLogoutAndNavigate = async () => {
    await handleLogout();
    router.replace('/Home');
  };

  const settingsOptions = [
    {
      id: '1',
      title: 'Change Theme',
      icon: 'color-palette',
      onPress: toggleTheme,
    },
    {
      id: '2',
      title: 'Logout',
      icon: 'log-out',
      onPress: handleLogoutAndNavigate,
    },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.item, { backgroundColor: theme.background }]} onPress={item.onPress}>
      <Ionicons name={item.icon} size={24} color={theme.text} style={styles.icon} />
      <Text style={[styles.itemText, { color: theme.text }]}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={settingsOptions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginRight: 16,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  button: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  }
});

export default SettingsScreen;

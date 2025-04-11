import { Redirect } from "expo-router";
import { useUser } from "./(context)/UserContext";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { userInfo, isGuestMode, enableGuestMode } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkGuestMode = async () => {
      const storedGuestMode = await AsyncStorage.getItem('isGuestMode');
      
      if (storedGuestMode === 'true') {
        enableGuestMode();
      }
      setIsLoading(false);
    };
    
    checkGuestMode();
  }, []);
  
  if (isLoading) {
    return null; // Or a loading indicator
  }
  
  if (userInfo || isGuestMode) {
    return <Redirect href="/(tabs)/Thoughts" />;
  } else {
    return <Redirect href="/Home" />;
  }
}
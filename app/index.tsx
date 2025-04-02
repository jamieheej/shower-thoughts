import { Redirect } from "expo-router";
import { useUser } from "./(context)/UserContext";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { userInfo, isGuestMode, enableGuestMode } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("Index mounted, userInfo:", userInfo ? "exists" : "null");
    console.log("Index mounted, isGuestMode:", isGuestMode);
    
    const checkGuestMode = async () => {
      const storedGuestMode = await AsyncStorage.getItem('isGuestMode');
      console.log("Stored guest mode:", storedGuestMode);
      
      if (storedGuestMode === 'true') {
        console.log("Enabling guest mode from storage");
        enableGuestMode();
      }
      setIsLoading(false);
    };
    
    checkGuestMode();
  }, []);
  
  if (isLoading) {
    return null; // Or a loading indicator
  }
  
  console.log("Index rendering, userInfo:", userInfo ? "exists" : "null", "isGuestMode:", isGuestMode);
  
  if (userInfo || isGuestMode) {
    return <Redirect href="/(tabs)/Thoughts" />;
  } else {
    return <Redirect href="/Home" />;
  }
}
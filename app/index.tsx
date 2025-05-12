import { Redirect } from "expo-router";
import { useUser } from "./(context)/UserContext";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Index() {
  const { userInfo, isGuestMode, enableGuestMode, setUserInfo } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuthAndGuestMode = async () => {
      // Check guest mode first
      const storedGuestMode = await AsyncStorage.getItem('isGuestMode');
      if (storedGuestMode === 'true') {
        enableGuestMode();
        setIsLoading(false);
        return;
      }
      
      // Then check Firebase auth state
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          setIsAuthenticated(true);
          
          // Make sure user info is set
          if (!userInfo) {
            setUserInfo({
              id: user.uid,
              email: user.email || '',
              name: user.displayName || '',
              photo: user.photoURL,
            });
          }
        } else {
          // User is not signed in
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      });
      
      // Clean up subscription
      return () => unsubscribe();
    };
    
    checkAuthAndGuestMode();
  }, []);
  
  if (isLoading) {
    return null; // Or a loading indicator
  }
  
  // Redirect based on authentication state
  if (userInfo || isGuestMode || isAuthenticated) {
    return <Redirect href="/(tabs)/Thoughts" />;
  } else {
    return <Redirect href="/Home" />;
  }
}
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { lightTheme, darkTheme } from '../theme';
import { getAuth } from "firebase/auth";
import { deleteDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import db from '@/firebase/firebaseConfig';

// Define the shape of the user context
interface UserContextType {
    userInfo: any; // Replace 'any' with your user info type
    setUserInfo: React.Dispatch<React.SetStateAction<any>>; // Replace 'any' with your user info type
    handleLogout: () => Promise<void>;
    theme: typeof lightTheme;
    toggleTheme: () => void;
    isDarkTheme: boolean; // Added to indicate if dark theme is active
    deleteUserAccount: () => Promise<void>;
}

// Create a context for user information with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

// Create a provider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    console.log("UserProvider rendered"); // Debug log
    const [userInfo, setUserInfo] = useState<any>(null); // Replace 'any' with your user info type
    const [theme, setTheme] = useState(lightTheme); // Default to light theme

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
    };

    // Determine if current theme is dark
    const isDarkTheme = theme === darkTheme;

    const handleLogout = async () => {
        if (userInfo?.loginMethod === "apple") {
            await handleAppleLogout();
        } else if (userInfo?.loginMethod === "google") {
            await handleGoogleLogout();
        }
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

    const deleteUserAccount = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            try {
                const thoughtsRef = collection(db, "thoughts");
                const q = query(thoughtsRef, where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);

                console.debug(`Found ${querySnapshot.size} thoughts for user ${user.uid}.`);

                if (querySnapshot.empty) {
                    console.debug("No thoughts found for this user.");
                } else {
                    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
                    await Promise.all(deletePromises);
                    console.debug("All thoughts deleted successfully.");
                }

                await deleteDoc(doc(collection(db, "users"), user.uid));
                console.debug("User document deleted from Firestore.");

                // Delete user from Firebase Auth
                await user.delete();
                console.debug("User deleted from Firebase Auth.");

                setUserInfo(null);
            } catch (error) {
                console.error("Error deleting user account:", error);
                throw error; 
            }
        } else {
            console.error("No user is currently logged in.");
        }
    };

    const contextValue = { 
        userInfo, 
        setUserInfo, 
        theme, 
        toggleTheme, 
        handleLogout,
        isDarkTheme,
        deleteUserAccount
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}; 

export default { UserProvider, useUser }
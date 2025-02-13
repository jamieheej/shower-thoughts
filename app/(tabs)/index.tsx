import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import { GoogleSignin, statusCodes, type User } from '@react-native-google-signin/google-signin';

const LoginScreen: React.FC = () => {
    const [userInfo, setUserInfo] = useState<User['user'] | null>(null);

    const signIn = async (): Promise<void> => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            setUserInfo(response.data?.user ?? null);
        } catch (error: any) {
            if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Sign in is in progress');
            } else {
                console.error(error);
            }
        }
    };

    const signOut = async (): Promise<void> => {
        try {
            await GoogleSignin.signOut();
            setUserInfo(null);
        } catch (error: any) {
            console.error(error);
        }
    };

    const userName = userInfo?.name ?? 'Guest';

    useEffect(() => {
        GoogleSignin.configure();
    }, []);

    return (
        <View>
            <Text>Welcome to the App</Text>
            {userInfo ? (
                <>
                    <Text>Welcome, {userName}</Text>
                    <Button title="Logout" onPress={signOut} />
                </>
            ) : (
                <Button title="Login with Google" onPress={signIn} />
            )}
        </View>
    );
};

export default LoginScreen;
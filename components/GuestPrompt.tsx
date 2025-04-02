import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@/app/(context)/UserContext';

export default React.memo(function GuestPrompt() {
    const router = useRouter();
    const { isGuestMode, disableGuestMode, theme } = useUser();
    
    if (!isGuestMode) return null;
    
    const handleSignIn = () => {
        disableGuestMode();
        router.push('/Home');
    };
    
    return (
        <View style={[styles.container, { backgroundColor: theme.border }]}>
            <Text style={[styles.text, { color: theme.text }]}>
                Sign in to sync your thoughts across devices and access more features.
            </Text>
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.buttonBackground }]} 
                onPress={handleSignIn}
            >
                <Text style={[styles.buttonText, { color: theme.buttonText }]}>Sign In</Text>
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    text: {
        fontSize: 14,
        marginBottom: 10,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 4,
        alignSelf: 'flex-end',
    },
    buttonText: {
        fontWeight: '500',
    },
}); 
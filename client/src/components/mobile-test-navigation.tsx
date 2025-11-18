// mobile-test-navigation.tsx

import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

const MobileTestNavigation = () => {
    return (
        <View style={styles.container}>
            <Image style={styles.image} source={{ uri: 'image_url_here' }} />
            <Text style={styles.text}>Test Navigation</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
        // Safe area insets
        backgroundColor: 'white',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 10,
        // Ensuring text wraps properly
    },
    touchableArea: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MobileTestNavigation;
// Updated mobile-test-navigation.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MobileTestNavigation = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.questionText}>Question text goes here</Text>
            <View style={styles.answersContainer}>
                {/* Answers with updated styles for text wrapping */}
                <TouchableOpacity style={styles.answerButton}>
                    <Text style={styles.answerText}>Answer option 1 goes here</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.answerButton}>
                    <Text style={styles.answerText}>Answer option 2 goes here</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 'calc(100vh - 156px)', // Fix content overflow
        paddingBottom: 'env(safe-area-inset-bottom)', // Add safe-area-inset-bottom support for iOS
        padding: 0,
    },
    questionText: {
        maxWidth: '100%',
        wordBreak: 'break-word', // Add break-words class
    },
    answersContainer: {
        paddingHorizontal: 12, // Optimize padding
        paddingVertical: 8, // Optimize padding
    },
    answerButton: {
        width: 44,
        height: 44,
        // Ensure all touch targets are 44px minimum
    },
    answerText: {
        fontSize: 18,
        lineHeight: 22,
    },
    radioButton: {
        width: 44, // Increase radio buttons
        height: 44,
    },
});

export default MobileTestNavigation;
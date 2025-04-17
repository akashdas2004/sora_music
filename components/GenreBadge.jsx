import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

const GenreBadge = ({ genre, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(genre)}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{genre.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default GenreBadge;
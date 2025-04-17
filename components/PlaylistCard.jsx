import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.4;

const PlaylistCard = ({ playlist, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(playlist)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: playlist.coverArt }} style={styles.coverArt} />
      <Text style={styles.title} numberOfLines={2}>{playlist.title}</Text>
      <Text style={styles.description} numberOfLines={1}>{playlist.description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    marginRight: 15,
  },
  coverArt: {
    width: cardWidth,
    height: cardWidth,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    color: '#b3b3b3',
    fontSize: 12,
  },
});

export default PlaylistCard;
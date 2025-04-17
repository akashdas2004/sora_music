import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TrackCard = ({ track, onPress, style }) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.leftSection}
        onPress={() => onPress(track)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: track.artwork }} style={styles.artwork} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.playButton} onPress={() => onPress(track)}>
        <Ionicons name="play-circle" size={36} color="#1DB954" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 15,
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  playButton: {
    marginLeft: 12,
  },
});

export default TrackCard;

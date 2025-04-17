import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';

import TrackCard from '../components/TrackCard';

// Mock data
const likedSongs = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', artwork: 'https://via.placeholder.com/300' },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', artwork: 'https://via.placeholder.com/300' },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd', artwork: 'https://via.placeholder.com/300' },
];

const recentlyPlayed = [
  { id: '4', title: 'Watermelon Sugar', artist: 'Harry Styles', artwork: 'https://via.placeholder.com/300' },
  { id: '5', title: 'Positions', artist: 'Ariana Grande', artwork: 'https://via.placeholder.com/300' },
];

const customPlaylists = [
  { id: '1', name: 'My Favorites', trackCount: 25 },
  { id: '2', name: 'Workout Mix', trackCount: 18 },
  { id: '3', name: 'Chill Vibes', trackCount: 32 },
];

const LibraryScreen = ({ playTrack }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Liked Songs');

  const renderRightActions = (progress, dragX) => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#1DB954' }]}>
          <Ionicons name="add-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E74C3C' }]}>
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    if (activeTab === 'Playlists') {
      return (
        <TouchableOpacity style={styles.playlistItem}>
          <View style={styles.playlistIcon}>
            <Ionicons name="musical-notes" size={24} color="white" />
          </View>
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text style={styles.playlistTracks}>{item.trackCount} tracks</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#b3b3b3" />
        </TouchableOpacity>
      );
    }

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TrackCard track={item} onPress={playTrack} />
      </Swipeable>
    );
  };

  const getData = () => {
    switch (activeTab) {
      case 'Liked Songs':
        return likedSongs;
      case 'Recently Played':
        return recentlyPlayed;
      case 'Playlists':
        return customPlaylists;
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color="white" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="add-outline" size={24} color="white" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {['Liked Songs', 'Recently Played', 'Playlists'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getData()}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  tabButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#2a2a2a',
  },
  activeTabButton: {
    backgroundColor: '#1DB954',
  },
  tabText: {
    color: '#b3b3b3',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    paddingTop: 10,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '80%',
    borderRadius: 8,
    marginLeft: 10,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 15,
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistTracks: {
    color: '#b3b3b3',
    fontSize: 14,
  },
});

export default LibraryScreen;
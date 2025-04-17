import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import TrackCard from '../components/TrackCard';
import PlaylistCard from '../components/PlaylistCard';
import GenreBadge from '../components/GenreBadge';

const trendingSongs = [
  {
    id: 'YALvuUpY_b0',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh',
    artwork: 'https://i.ytimg.com/vi/YALvuUpY_b0/hqdefault.jpg',
    videoId: 'YALvuUpY_b0',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    artwork: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    videoId: 'kJQP7kiw5Fk',
  },
  {
    id: 'UceaB4D0jpo',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    artwork: 'https://i.ytimg.com/vi/UceaB4D0jpo/hqdefault.jpg',
    videoId: 'UceaB4D0jpo',
  },
];

const genres = [
  { id: '1', name: 'Pop' },
  { id: '2', name: 'Hip Hop' },
  { id: '3', name: 'Rock' },
  { id: '4', name: 'Electronic' },
  { id: '5', name: 'R&B' },
  { id: '6', name: 'Indie' },
];

const featuredPlaylists = [
  {
    id: '1',
    title: 'Today\'s Top Hits',
    description: 'The hottest tracks right now',
    coverArt: 'https://via.placeholder.com/300',
  },
  {
    id: '2',
    title: 'RapCaviar',
    description: 'New music from Drake, Lil Baby and more',
    coverArt: 'https://via.placeholder.com/300',
  },
  {
    id: '3',
    title: 'All Out 2010s',
    description: 'The biggest songs of the 2010s',
    coverArt: 'https://via.placeholder.com/300',
  },
];

const HomeScreen = ({ playTrack }) => {
  const insets = useSafeAreaInsets();

  const handlePlay = (track) => {
    playTrack({
      ...track,
      // Optional: fallback if artwork/videoId is missing
      artwork: track.artwork || 'https://via.placeholder.com/300',
      artist: track.artist || 'Unknown',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good evening</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="notifications-outline" size={24} color="white" style={styles.icon} />
            <Ionicons name="settings-outline" size={24} color="white" style={styles.icon} />
          </View>
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending Songs</Text>
          {trendingSongs.map((track) => (
            <TrackCard key={track.id} track={track} onPress={() => handlePlay(track)} />
          ))}
        </View>

        {/* Genres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎧 Top Genres</Text>
          <View style={styles.genresContainer}>
            {genres.map((genre) => (
              <GenreBadge key={genre.id} genre={genre} onPress={() => console.log(`Genre: ${genre.name}`)} />
            ))}
          </View>
        </View>

        {/* Playlists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💿 Featured Playlists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featuredPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onPress={() => console.log(`Playlist: ${playlist.title}`)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10,
  },
  greeting: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row' },
  icon: { marginLeft: 20 },
  section: { marginTop: 25 },
  sectionTitle: {
    color: 'white', fontSize: 20,
    fontWeight: 'bold', marginBottom: 15, paddingHorizontal: 15,
  },
  genresContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  horizontalScroll: {
    paddingLeft: 15,
    paddingBottom: 10,
  },
});

export default HomeScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

import TrackCard from '../components/TrackCard';
import audioPlayer from '../audioPlayer';

const API_URL = process.env.API_URL || 'https://5b02-45-64-238-220.ngrok-free.app';

const SearchScreen = ({ playTrack, navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const delay = setTimeout(() => {
        fetchSearchResults(searchQuery);
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchSearchResults = async (query) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_URL}/search`, {
        params: { query },
        timeout: 10000,
      });

      const results = res.data?.results || [];
      setSearchResults(results);
    } catch (err) {
      console.error('❌ Error fetching search results:', err.message || err);
      setError('Failed to fetch search results. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (item) => {
    try {
      setPlayingId(item.videoId);
      setError(null);

      const query = `${item.title} ${item.artist}`;
      const response = await axios.get(`${API_URL}/stream-url`, {
        params: { query },
        timeout: 15000,
      });

      const streamUrl = response.data?.stream_url;
      if (!streamUrl) {
        setError('Could not get stream URL for this track');
        return;
      }

      const track = {
        id: item.videoId,
        title: item.title,
        artist: item.artist,
        artwork: item.thumbnail,
        duration: item.duration || 180,
        url: streamUrl,
      };

      playTrack?.(track, navigation); // Set track & navigate
      await audioPlayer.play(track);  // Then play

    } catch (err) {
      console.error('❌ Failed to play track:', err.message || err);
      setError('Failed to load track.');
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <TrackCard
      track={{
        id: item.videoId,
        title: item.title,
        artist: item.artist,
        artwork: item.thumbnail,
      }}
      onPress={() => handlePlayTrack(item)}
      style={item.videoId === playingId ? { backgroundColor: '#1a1a1a' } : null}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#bbb" />
        <TextInput
          style={styles.input}
          placeholder="Search songs, artists..."
          placeholderTextColor="#bbb"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      ) : error ? (
        <View style={styles.noResults}>
          <Ionicons name="alert-circle-outline" size={50} color="#ff4d4f" />
          <Text style={styles.noResultsText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchSearchResults(searchQuery)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.videoId}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        searchQuery.length > 1 && (
          <View style={styles.noResults}>
            <Ionicons name="musical-notes-outline" size={60} color="#666" />
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 16,
    height: 45,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  noResultsText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SearchScreen;

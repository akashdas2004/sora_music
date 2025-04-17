import React, { createContext, useState, useContext, useEffect } from 'react';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
    return true;
  } catch (error) {
    console.error('Error setting up the player:', error);
    return false;
  }
};

export const PlayerProvider = ({ children }) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  
  const playbackState = usePlaybackState();
  const progress = useProgress();

  useEffect(() => {
    const startPlayer = async () => {
      const isSetup = await setupPlayer();
      setIsPlayerReady(isSetup);
    };

    startPlayer();

    return () => {
      TrackPlayer.destroy();
    };
  }, []);

  useEffect(() => {
    if (playbackState === State.Playing) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [playbackState]);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== undefined) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      setCurrentTrack(track);
    }
  });

  const loadPlaylist = async (tracks, initialIndex = 0) => {
    if (!isPlayerReady) return;

    await TrackPlayer.reset();
    await TrackPlayer.add(tracks);
    setQueue(tracks);
    
    if (tracks.length > 0) {
      await TrackPlayer.skip(initialIndex);
      setCurrentTrack(tracks[initialIndex]);
      await TrackPlayer.play();
    }
  };

  const playTrack = async (track) => {
    if (!isPlayerReady) return;

    const trackIndex = queue.findIndex(t => t.id === track.id);
    
    if (trackIndex !== -1) {
      await TrackPlayer.skip(trackIndex);
    } else {
      await TrackPlayer.add(track);
      const newQueue = [...queue, track];
      setQueue(newQueue);
      await TrackPlayer.skip(newQueue.length - 1);
    }
    
    setCurrentTrack(track);
    await TrackPlayer.play();
  };

  const togglePlayPause = async () => {
    if (!isPlayerReady) return;

    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = async () => {
    if (!isPlayerReady) return;
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async () => {
    if (!isPlayerReady) return;
    await TrackPlayer.skipToPrevious();
  };

  const toggleRepeatMode = async () => {
    if (!isPlayerReady) return;

    let newMode;
    switch (repeatMode) {
      case RepeatMode.Off:
        newMode = RepeatMode.Track;
        break;
      case RepeatMode.Track:
        newMode = RepeatMode.Queue;
        break;
      case RepeatMode.Queue:
        newMode = RepeatMode.Off;
        break;
      default:
        newMode = RepeatMode.Off;
    }

    await TrackPlayer.setRepeatMode(newMode);
    setRepeatMode(newMode);
  };

  const toggleShuffle = async () => {
    if (!isPlayerReady) return;
    
    setIsShuffleOn(!isShuffleOn);
    
    if (!isShuffleOn) {
      // Implement shuffle logic
      const currentIndex = await TrackPlayer.getCurrentTrack();
      const currentTrack = queue[currentIndex];
      
      let shuffledQueue = [...queue];
      shuffledQueue.splice(currentIndex, 1); // Remove current track
      
      // Fisher-Yates shuffle algorithm
      for (let i = shuffledQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
      }
      
      // Put current track at the beginning
      shuffledQueue = [currentTrack, ...shuffledQueue];
      
      await TrackPlayer.reset();
      await TrackPlayer.add(shuffledQueue);
      setQueue(shuffledQueue);
      await TrackPlayer.play();
    } else {
      // Restore original queue order (would need to store original queue)
      // For simplicity, we're not implementing this now
    }
  };

  const seekTo = async (position) => {
    if (!isPlayerReady) return;
    await TrackPlayer.seekTo(position);
  };

  const removeFromQueue = async (trackId) => {
    if (!isPlayerReady) return;
    
    const trackIndex = queue.findIndex(t => t.id === trackId);
    if (trackIndex !== -1) {
      await TrackPlayer.remove(trackIndex);
      const newQueue = queue.filter(t => t.id !== trackId);
      setQueue(newQueue);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        isPlayerReady,
        currentTrack,
        queue,
        isPlaying,
        repeatMode,
        isShuffleOn,
        progress,
        loadPlaylist,
        playTrack,
        togglePlayPause,
        skipToNext,
        skipToPrevious,
        toggleRepeatMode,
        toggleShuffle,
        seekTo,
        removeFromQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
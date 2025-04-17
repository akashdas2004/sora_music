"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  ActivityIndicator,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "react-native-vector-icons/Ionicons"
import Slider from "@react-native-community/slider"
import audioPlayer from "../audioPlayer"

const { width } = Dimensions.get("window")

const NowPlayingScreen = ({ navigation, track: initialTrack }) => {
  const insets = useSafeAreaInsets()
  const [track, setTrack] = useState(initialTrack || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(1)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState("off")
  const [isLiked, setIsLiked] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedOptions, setShowSpeedOptions] = useState(false)
  const [showTimeRemaining, setShowTimeRemaining] = useState(false)

  const spinValue = useRef(new Animated.Value(0)).current
  const spinAnim = useRef(null)

  // Set up listener for audio status updates
  useEffect(() => {
    const unsub = audioPlayer.addListener(
      ({
        currentTrack,
        isPlaying,
        progress,
        duration,
        isBuffering,
        shuffleMode,
        repeatMode,
        volume,
        playbackSpeed,
      }) => {
        setTrack(currentTrack || initialTrack)
        setIsPlaying(isPlaying)
        setProgress(progress)
        setDuration(duration || 1) // Ensure duration is never 0
        setIsBuffering(isBuffering ?? false)
        setIsShuffle(shuffleMode)
        setRepeatMode(repeatMode)
        setVolume(volume)
        setPlaybackSpeed(playbackSpeed)
      },
    )

    // Check if current track is liked
    const checkLiked = async () => {
      if (track?.id) {
        const liked = await audioPlayer.isTrackLiked(track.id)
        setIsLiked(liked)
      }
    }

    checkLiked()

    return () => unsub()
  }, [initialTrack, track?.id])

  // Fixed: Improved animation handling
  useEffect(() => {
    // Stop any existing animation
    if (spinAnim.current) {
      spinAnim.current.stop()
    }

    if (isPlaying) {
      // Create and start a new animation
      spinAnim.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      )
      spinAnim.current.start()
    } else {
      // Pause the animation but don't reset the value
      if (spinAnim.current) {
        spinAnim.current.stop()
      }
    }

    // Cleanup on unmount
    return () => {
      if (spinAnim.current) {
        spinAnim.current.stop()
      }
    }
  }, [isPlaying, spinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const formatTime = (milliseconds) => {
    if (!milliseconds || isNaN(milliseconds)) return "0:00"
    const totalSeconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || isNaN(milliseconds)) return "-0:00"
    const totalSeconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `-${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleToggleLike = async () => {
    if (track) {
      const newLikedState = await audioPlayer.toggleLike(track)
      if (newLikedState !== null) {
        setIsLiked(newLikedState)
      }
    }
  }

  const handleToggleShuffle = () => {
    const shuffleState = audioPlayer.toggleShuffle()
    setIsShuffle(shuffleState)
  }

  const handleToggleRepeat = () => {
    const repeatState = audioPlayer.toggleRepeat()
    setRepeatMode(repeatState)
  }

  const handleVolumeChange = (value) => {
    audioPlayer.setVolume(value)
    setVolume(value)
  }

  const handleSetPlaybackSpeed = (speed) => {
    audioPlayer.setPlaybackSpeed(speed)
    setPlaybackSpeed(speed)
    setShowSpeedOptions(false)
  }

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case "one":
        return "repeat-once"
      case "all":
      case "off":
      default:
        return "repeat"
    }
  }

  if (!track) {
    return (
      <SafeAreaView
        style={[styles.container, { paddingTop: insets.top, alignItems: "center", justifyContent: "center" }]}
      >
        <Text style={{ color: "#999", fontSize: 16 }}>Nothing is playing right now</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.artworkContainer}>
        <Animated.View style={[styles.vinylContainer, { transform: [{ rotate: spin }] }]}>
          <Image
            source={{ uri: track.artwork || "https://via.placeholder.com/500" }}
            style={styles.artwork}
            defaultSource={require("../assets/default-artwork.png")}
          />
        </Animated.View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          value={duration > 0 ? progress / duration : 0}
          onSlidingStart={() => {}}
          onSlidingComplete={(val) => {
            const seekTo = val * duration
            audioPlayer.seek(seekTo)
          }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#333"
          thumbTintColor="#1DB954"
          disabled={isBuffering && progress === 0}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(progress / 1000)}</Text>
          <TouchableOpacity onPress={() => setShowTimeRemaining(!showTimeRemaining)}>
            <Text style={styles.timeText}>
              {showTimeRemaining ? formatTimeRemaining((duration - progress) / 1000) : formatTime(duration / 1000)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handleToggleShuffle}>
          <Ionicons name="shuffle" size={24} color={isShuffle ? "#1DB954" : "#888"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => audioPlayer.prev()}>
          <Ionicons name="play-skip-back" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => (isPlaying ? audioPlayer.pause() : audioPlayer.resume())}
        >
          {isBuffering && progress === 0 ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => audioPlayer.next()}>
          <Ionicons name="play-skip-forward" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToggleRepeat}>
          <Ionicons name={getRepeatIcon()} size={24} color={repeatMode !== "off" ? "#1DB954" : "#888"} />
        </TouchableOpacity>
      </View>

      {showVolumeSlider && (
        <View style={styles.volumeContainer}>
          <Ionicons name="volume-low" size={20} color="#888" />
          <Slider
            style={styles.volumeSlider}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#333"
            thumbTintColor="#1DB954"
          />
          <Ionicons name="volume-high" size={20} color="#888" />
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => setShowVolumeSlider(!showVolumeSlider)}>
          <Ionicons name="volume-medium" size={24} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleToggleLike}>
          <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "#1DB954" : "#888"} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowSpeedOptions(!showSpeedOptions)}>
          <Text style={[styles.speedText, playbackSpeed !== 1 && styles.activeSpeedText]}>{playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>

      {showSpeedOptions && (
        <View style={styles.speedOptionsContainer}>
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
            <TouchableOpacity
              key={speed}
              style={[styles.speedOption, playbackSpeed === speed && styles.activeSpeedOption]}
              onPress={() => handleSetPlaybackSpeed(speed)}
            >
              <Text style={[styles.speedOptionText, playbackSpeed === speed && styles.activeSpeedOptionText]}>
                {speed}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.visualizerContainer}>
        <View style={styles.waveformContainer}>
          {Array.from({ length: 30 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: Math.random() * 50 + 10,
                  opacity: isPlaying ? 1 : 0.3,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerTitle: { color: "white", fontSize: 16, fontWeight: "600" },
  artworkContainer: { alignItems: "center", marginTop: 20 },
  vinylContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  artwork: { width: width * 0.65, height: width * 0.65, borderRadius: width * 0.325 },
  infoContainer: { alignItems: "center", marginTop: 30, paddingHorizontal: 20 },
  title: { color: "white", fontSize: 24, fontWeight: "bold", textAlign: "center" },
  artist: { color: "#b3b3b3", fontSize: 18, marginTop: 5, textAlign: "center" },
  progressContainer: { marginTop: 30, paddingHorizontal: 20 },
  slider: { width: "100%", height: 40 },
  timeContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: -10 },
  timeText: { color: "#b3b3b3", fontSize: 12 },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 30,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingHorizontal: 100,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 10,
  },
  speedText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeSpeedText: {
    color: "#1DB954",
  },
  speedOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  speedOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#333",
  },
  activeSpeedOption: {
    backgroundColor: "#1DB954",
  },
  speedOptionText: {
    color: "#fff",
    fontSize: 14,
  },
  activeSpeedOptionText: {
    fontWeight: "bold",
  },
  visualizerContainer: { marginTop: 30, paddingHorizontal: 20, height: 60, justifyContent: "center" },
  waveformContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 60 },
  waveformBar: { width: 4, backgroundColor: "#1DB954", borderRadius: 2 },
})

export default NowPlayingScreen

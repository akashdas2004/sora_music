"use client"

import { useState, useEffect } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { PanGestureHandler, GestureHandlerRootView, LongPressGestureHandler, State } from "react-native-gesture-handler"
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated"
import audioPlayer from "../audioPlayer"

const { width } = Dimensions.get("window")

const MiniPlayer = ({ track, onPress, isPlaying, progress = 0, duration = 1, navigateToNowPlaying }) => {
  const [isSeeking, setIsSeeking] = useState(false)
  const [showRemainingTime, setShowRemainingTime] = useState(false)
  const progressValue = useSharedValue(0)

  const swipeY = useSharedValue(0)

  useEffect(() => {
    if (!isSeeking && duration > 0) {
      progressValue.value = progress / duration
    }
  }, [progress, duration, isSeeking, progressValue])

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = swipeY.value
    },
    onActive: (event, ctx) => {
      swipeY.value = ctx.startY + event.translationY
    },
    onEnd: (event) => {
      if (event.translationY < -30) {
        runOnJS(navigateToNowPlaying)()
      }
      swipeY.value = withTiming(0)
    },
  })

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }))

  const onLongPress = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      showOptions()
    }
  }

  const showOptions = () => {
    Alert.alert(
      "Track Options",
      "Choose an action",
      [
        {
          text: track.isLiked ? "Remove from Favorites" : "Add to Favorites",
          onPress: () => audioPlayer.toggleLike(track),
        },
        {
          text: "Remove from Queue",
          onPress: () => {
            const index = audioPlayer.queue.findIndex((t) => t.id === track.id)
            if (index !== -1) {
              audioPlayer.removeFromQueue(index)
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true },
    )
  }

  if (!track) return null

  const formatTime = (ms) => {
    const sec = Math.floor(ms / 1000)
    const min = Math.floor(sec / 60)
    const remSec = sec % 60
    return `${min}:${remSec < 10 ? "0" : ""}${remSec}`
  }

  const formatRemainingTime = (ms) => {
    const sec = Math.floor(ms / 1000)
    const min = Math.floor(sec / 60)
    const remSec = sec % 60
    return `-${min}:${remSec < 10 ? "0" : ""}${remSec}`
  }

  return (
    <GestureHandlerRootView>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={styles.container}>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, progressStyle]} />
          </View>

          <LongPressGestureHandler onHandlerStateChange={onLongPress} minDurationMs={500}>
            <View style={styles.mainContent}>
              <Image source={{ uri: track.artwork }} style={styles.artwork} />
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </View>

              <TouchableOpacity style={styles.timeContainer} onPress={() => setShowRemainingTime(!showRemainingTime)}>
                <Text style={styles.timeText}>
                  {showRemainingTime ? formatRemainingTime(duration - progress) : formatTime(progress)}
                </Text>
              </TouchableOpacity>

              <View style={styles.controls}>
                <TouchableOpacity onPress={() => (isPlaying ? audioPlayer.pause() : audioPlayer.resume())}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => audioPlayer.next()}>
                  <Ionicons name="play-skip-forward" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </LongPressGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#282828",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  progressBarContainer: {
    height: 3,
    width: "100%",
    backgroundColor: "#444",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#1DB954",
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  artist: {
    color: "#b3b3b3",
    fontSize: 12,
  },
  timeContainer: {
    marginRight: 10,
  },
  timeText: {
    color: "#b3b3b3",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
})

export default MiniPlayer

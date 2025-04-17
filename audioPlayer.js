import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Storage keys
const STORAGE_KEYS = {
  CURRENT_TRACK: "@music_app/current_track",
  CURRENT_POSITION: "@music_app/current_position",
  QUEUE: "@music_app/queue",
  HISTORY: "@music_app/history",
  LIKED_SONGS: "@music_app/liked_songs",
  REPEAT_MODE: "@music_app/repeat_mode",
  SHUFFLE_MODE: "@music_app/shuffle_mode",
  VOLUME: "@music_app/volume",
  PLAYBACK_SPEED: "@music_app/playback_speed",
}

// Repeat modes
const REPEAT_MODES = {
  OFF: "off",
  ONE: "one",
  ALL: "all",
}

class AudioPlayer {
  constructor() {
    this.currentTrack = null
    this.isPlaying = false
    this.progress = 0
    this.duration = 0
    this.isBuffering = false
    this.sound = null
    this.listeners = []
    this.isPlaybackLocked = false // Lock to prevent simultaneous playback

    // New properties for enhanced features
    this.queue = []
    this.history = []
    this.currentIndex = -1
    this.repeatMode = REPEAT_MODES.OFF
    this.shuffleMode = false
    this.volume = 1.0
    this.playbackSpeed = 1.0
    this.crossfadeTimer = null
    this.crossfadeDuration = 3000 // 3 seconds crossfade

    // Initialize state from storage
    this._loadStateFromStorage()
  }

  // Load saved state from AsyncStorage
  async _loadStateFromStorage() {
    try {
      // Load repeat and shuffle modes
      const repeatMode = await AsyncStorage.getItem(STORAGE_KEYS.REPEAT_MODE)
      if (repeatMode) this.repeatMode = repeatMode

      const shuffleMode = await AsyncStorage.getItem(STORAGE_KEYS.SHUFFLE_MODE)
      if (shuffleMode) this.shuffleMode = shuffleMode === "true"

      // Load volume and playback speed
      const volume = await AsyncStorage.getItem(STORAGE_KEYS.VOLUME)
      if (volume) this.volume = Number.parseFloat(volume)

      const playbackSpeed = await AsyncStorage.getItem(STORAGE_KEYS.PLAYBACK_SPEED)
      if (playbackSpeed) this.playbackSpeed = Number.parseFloat(playbackSpeed)

      // Load queue and history
      const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.QUEUE)
      if (queueJson) this.queue = JSON.parse(queueJson)

      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY)
      if (historyJson) this.history = JSON.parse(historyJson)

      // Load last played track and position for smart resume
      const trackJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TRACK)
      const positionStr = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_POSITION)

      if (trackJson && positionStr) {
        const savedTrack = JSON.parse(trackJson)
        const position = Number.parseInt(positionStr, 10)

        // Find the track in the queue
        const trackIndex = this.queue.findIndex((t) => t.id === savedTrack.id)
        if (trackIndex !== -1) {
          this.currentIndex = trackIndex
          this.currentTrack = savedTrack
          this.progress = position

          console.log("📂 Restored last session:", savedTrack.title, "at position", position)
          this._notifyListeners()
        }
      }
    } catch (err) {
      console.error("❌ Error loading state from storage:", err.message)
    }
  }

  // Save current state to AsyncStorage
  async _saveStateToStorage() {
    try {
      if (this.currentTrack) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, JSON.stringify(this.currentTrack))
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_POSITION, String(this.progress))
      }

      await AsyncStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(this.queue))
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(this.history))
      await AsyncStorage.setItem(STORAGE_KEYS.REPEAT_MODE, this.repeatMode)
      await AsyncStorage.setItem(STORAGE_KEYS.SHUFFLE_MODE, String(this.shuffleMode))
      await AsyncStorage.setItem(STORAGE_KEYS.VOLUME, String(this.volume))
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYBACK_SPEED, String(this.playbackSpeed))
    } catch (err) {
      console.error("❌ Error saving state to storage:", err.message)
    }
  }

  // Queue management
  setQueue(tracks, startIndex = 0) {
    this.queue = [...tracks]
    this.currentIndex = startIndex >= 0 && startIndex < tracks.length ? startIndex : 0
    this._saveStateToStorage()
    console.log("🎵 Queue set with", tracks.length, "tracks, starting at index", this.currentIndex)
  }

  addToQueue(track) {
    this.queue.push(track)
    // If this is the first track, set current index
    if (this.queue.length === 1) {
      this.currentIndex = 0
    }
    this._saveStateToStorage()
    console.log("➕ Added to queue:", track.title)
    return this.queue.length - 1 // Return the index of the added track
  }

  removeFromQueue(index) {
    if (index >= 0 && index < this.queue.length) {
      // Adjust currentIndex if needed
      if (index < this.currentIndex) {
        this.currentIndex--
      } else if (index === this.currentIndex) {
        // If removing current track, stop playback
        if (this.isPlaying) {
          this.stop()
        }
        // If there are more tracks, set current to next
        if (this.queue.length > 1) {
          this.currentIndex = Math.min(this.currentIndex, this.queue.length - 2)
        } else {
          this.currentIndex = -1
        }
      }

      this.queue.splice(index, 1)
      this._saveStateToStorage()
      console.log("➖ Removed track at index", index, "from queue")
    }
  }

  clearQueue() {
    this.stop()
    this.queue = []
    this.currentIndex = -1
    this._saveStateToStorage()
    console.log("🧹 Queue cleared")
  }

  // Shuffle mode
  toggleShuffle() {
    this.shuffleMode = !this.shuffleMode

    if (this.shuffleMode && this.queue.length > 1) {
      // Save current track
      const currentTrack = this.currentIndex >= 0 ? this.queue[this.currentIndex] : null

      // Shuffle the queue (Fisher-Yates algorithm)
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]]
      }

      // If we had a current track, find its new position
      if (currentTrack) {
        const newIndex = this.queue.findIndex((track) => track.id === currentTrack.id)
        this.currentIndex = newIndex !== -1 ? newIndex : 0
      }
    }

    this._saveStateToStorage()
    console.log("🔀 Shuffle mode:", this.shuffleMode ? "ON" : "OFF")
    this._notifyListeners()
    return this.shuffleMode
  }

  // Repeat mode
  toggleRepeat() {
    // Cycle through repeat modes: OFF -> ONE -> ALL -> OFF
    switch (this.repeatMode) {
      case REPEAT_MODES.OFF:
        this.repeatMode = REPEAT_MODES.ONE
        break
      case REPEAT_MODES.ONE:
        this.repeatMode = REPEAT_MODES.ALL
        break
      case REPEAT_MODES.ALL:
        this.repeatMode = REPEAT_MODES.OFF
        break
      default:
        this.repeatMode = REPEAT_MODES.OFF
    }

    this._saveStateToStorage()
    console.log("🔁 Repeat mode:", this.repeatMode)
    this._notifyListeners()
    return this.repeatMode
  }

  // Volume control
  async setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)) // Clamp between 0 and 1

    if (this.sound) {
      await this.sound.setVolumeAsync(this.volume)
    }

    this._saveStateToStorage()
    console.log("🔊 Volume set to:", this.volume)
    this._notifyListeners()
    return this.volume
  }

  // Playback speed control
  async setPlaybackSpeed(speed) {
    this.playbackSpeed = Math.max(0.5, Math.min(2, speed)) // Clamp between 0.5 and 2

    if (this.sound) {
      await this.sound.setRateAsync(this.playbackSpeed, true) // Second param: shouldCorrectPitch
    }

    this._saveStateToStorage()
    console.log("⏩ Playback speed set to:", this.playbackSpeed)
    this._notifyListeners()
    return this.playbackSpeed
  }

  // Next track
  async next() {
    if (this.queue.length === 0) {
      console.log("⚠️ Cannot skip to next: Queue is empty")
      return false
    }

    // Handle repeat one mode
    if (this.repeatMode === REPEAT_MODES.ONE && this.currentTrack) {
      await this.seek(0)
      if (!this.isPlaying) {
        await this.resume()
      }
      return true
    }

    // Calculate next index
    let nextIndex = this.currentIndex + 1

    // Handle repeat all mode
    if (nextIndex >= this.queue.length) {
      if (this.repeatMode === REPEAT_MODES.ALL) {
        nextIndex = 0
      } else {
        console.log("⚠️ Reached end of queue")
        return false
      }
    }

    // Play the next track
    this.currentIndex = nextIndex
    const nextTrack = this.queue[this.currentIndex]

    if (nextTrack) {
      console.log("⏭️ Playing next track:", nextTrack.title)
      await this.play(nextTrack)
      return true
    }

    return false
  }

  // Previous track
  async prev() {
    if (this.queue.length === 0) {
      console.log("⚠️ Cannot go to previous: Queue is empty")
      return false
    }

    // If we're more than 3 seconds into the song, restart it instead of going to previous
    if (this.progress > 3000) {
      await this.seek(0)
      return true
    }

    // Calculate previous index
    let prevIndex = this.currentIndex - 1

    // Handle repeat all mode
    if (prevIndex < 0) {
      if (this.repeatMode === REPEAT_MODES.ALL) {
        prevIndex = this.queue.length - 1
      } else {
        console.log("⚠️ Reached beginning of queue")
        return false
      }
    }

    // Play the previous track
    this.currentIndex = prevIndex
    const prevTrack = this.queue[this.currentIndex]

    if (prevTrack) {
      console.log("⏮️ Playing previous track:", prevTrack.title)
      await this.play(prevTrack)
      return true
    }

    return false
  }

  // Add to history
  _addToHistory(track) {
    if (!track) return

    // Remove the track if it already exists in history
    this.history = this.history.filter((t) => t.id !== track.id)

    // Add to the beginning of history
    this.history.unshift(track)

    // Limit history to 50 items
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50)
    }

    this._saveStateToStorage()
  }

  // Crossfade to next track
  async _crossfadeToNext() {
    if (this.queue.length <= 1 || this.currentIndex === -1) return

    // Calculate next index
    let nextIndex = this.currentIndex + 1
    if (nextIndex >= this.queue.length) {
      if (this.repeatMode === REPEAT_MODES.ALL) {
        nextIndex = 0
      } else {
        return
      }
    }

    const nextTrack = this.queue[nextIndex]
    if (!nextTrack) return

    // Create a new sound instance for the next track
    try {
      const { sound: nextSound } = await Audio.Sound.createAsync(
        { uri: nextTrack.url },
        {
          shouldPlay: false,
          volume: 0, // Start with volume 0
          rate: this.playbackSpeed,
        },
        this._onNextTrackStatusUpdate.bind(this),
      )

      // Start playing the next track
      await nextSound.playAsync()

      // Fade out current track, fade in next track
      const steps = 10
      const stepDuration = this.crossfadeDuration / steps

      for (let i = 1; i <= steps; i++) {
        const ratio = i / steps
        const currentVolume = this.volume * (1 - ratio)
        const nextVolume = this.volume * ratio

        // Set volumes
        if (this.sound) {
          await this.sound.setVolumeAsync(currentVolume)
        }
        await nextSound.setVolumeAsync(nextVolume)

        // Wait for step duration
        await new Promise((resolve) => setTimeout(resolve, stepDuration))
      }

      // Stop the current track
      if (this.sound) {
        await this.sound.stopAsync()
        await this.sound.unloadAsync()
      }

      // Update state
      this.sound = nextSound
      this.currentIndex = nextIndex
      this.currentTrack = nextTrack
      this.progress = 0
      this._addToHistory(nextTrack)
      this._notifyListeners()

      console.log("🔄 Crossfaded to:", nextTrack.title)
    } catch (err) {
      console.error("❌ Error during crossfade:", err.message)
    }
  }

  _onNextTrackStatusUpdate(status) {
    // This is used only during crossfade
    if (!status.isLoaded) return

    // Once the next track is loaded and playing, we'll handle its status updates
    // but we don't want to notify listeners yet
  }

  // Enhanced play method
  async play(track) {
    try {
      // If already playing the selected track, do nothing
      if (this.currentTrack?.id === track.id && this.isPlaying) {
        console.log("⚠️ Already playing the selected track:", track.title)
        return
      }

      // If playback is locked, return to prevent simultaneous playback
      if (this.isPlaybackLocked) {
        console.log("⚠️ Playback locked, waiting for previous operation to complete")
        return
      }

      // Lock playback to prevent multiple simultaneous calls
      this.isPlaybackLocked = true

      // Cancel any crossfade in progress
      if (this.crossfadeTimer) {
        clearTimeout(this.crossfadeTimer)
        this.crossfadeTimer = null
      }

      console.log("⏹️ Stopping current track (if any)...")
      await this.stop()

      console.log("⏳ Starting new track:", track.title)
      this.currentTrack = track
      this.progress = 0
      this.duration = 0
      this.isPlaying = false
      this.isBuffering = true

      // If the track is not in the queue, add it
      if (!this.queue.some((t) => t.id === track.id)) {
        this.currentIndex = this.addToQueue(track)
      } else {
        // Find the track in the queue
        this.currentIndex = this.queue.findIndex((t) => t.id === track.id)
      }

      this._notifyListeners()

      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.url },
        {
          shouldPlay: true,
          volume: this.volume,
          rate: this.playbackSpeed,
          // If this is a repeat-one track, set isLooping
          isLooping: this.repeatMode === REPEAT_MODES.ONE,
        },
        this._onPlaybackStatusUpdate.bind(this),
      )

      this.sound = sound
      this.isPlaying = true
      this.isBuffering = false

      // Add to history
      this._addToHistory(track)

      this._notifyListeners()
      this._saveStateToStorage()

      console.log("🎵 Playback started for:", track.title)
    } catch (err) {
      console.error("❌ Error in play():", err.message || err)
      this.isBuffering = false
      this._notifyListeners()

      // Auto retry once on failure
      if (!track._retried) {
        console.log("🔄 Retrying playback...")
        track._retried = true
        setTimeout(() => this.play(track), 1000)
      }
    } finally {
      // Unlock playback when operation completes
      this.isPlaybackLocked = false
    }
  }

  async pause() {
    if (this.sound && this.isPlaying) {
      try {
        await this.sound.pauseAsync()
        this.isPlaying = false
        console.log("⏸️ Paused track:", this.currentTrack?.title)
        this._notifyListeners()
        this._saveStateToStorage()
      } catch (err) {
        console.error("❌ Error in pause():", err.message)
      }
    }
  }

  async resume() {
    if (this.sound && !this.isPlaying) {
      try {
        await this.sound.playAsync()
        this.isPlaying = true
        console.log("▶️ Resumed track:", this.currentTrack?.title)
        this._notifyListeners()
      } catch (err) {
        console.error("❌ Error in resume():", err.message)
      }
    }
  }

  async stop() {
    // Cancel any crossfade in progress
    if (this.crossfadeTimer) {
      clearTimeout(this.crossfadeTimer)
      this.crossfadeTimer = null
    }

    if (this.sound) {
      try {
        this.sound.setOnPlaybackStatusUpdate(null)
        await this.sound.stopAsync()
        await this.sound.unloadAsync()
        this.sound = null
        console.log("🛑 Stopped playback.")
      } catch (err) {
        console.error("❌ Error in stop():", err.message)
      }
    }

    this.isPlaying = false
    this.progress = 0
    this.duration = 0
    this.isBuffering = false
    this._notifyListeners()
    this._saveStateToStorage()
  }

  async seek(positionMillis) {
    if (this.sound) {
      try {
        await this.sound.setPositionAsync(positionMillis)
        this.progress = positionMillis
        console.log(`⏩ Seeked to ${Math.floor(positionMillis / 1000)}s`)
        this._notifyListeners()
        this._saveStateToStorage()
      } catch (err) {
        console.error("❌ Error in seek():", err.message)
      }
    }
  }

  _onPlaybackStatusUpdate(status) {
    if (!status.isLoaded) {
      // Handle error or unloaded state
      if (status.error) {
        console.error(`❌ Playback error: ${status.error}`)
        this.isBuffering = false
        this._notifyListeners()
      }
      return
    }

    this.progress = status.positionMillis
    this.duration = status.durationMillis ?? this.duration
    this.isPlaying = status.isPlaying ?? this.isPlaying
    this.isBuffering = status.isBuffering ?? false

    // Save current position periodically (every 5 seconds)
    if (this.progress % 5000 < 100) {
      this._saveStateToStorage()
    }

    this._notifyListeners()

    // Handle track completion
    if (status.didJustFinish && !status.isLooping) {
      console.log("✅ Track finished playing:", this.currentTrack?.title)

      // Handle repeat modes
      if (this.repeatMode === REPEAT_MODES.ONE) {
        // Repeat the current track
        this.seek(0)
      } else {
        // Move to next track or stop
        this.next()
      }
    }

    // Set up crossfade if approaching the end of the track
    if (
      this.duration > 0 &&
      this.progress > 0 &&
      this.duration - this.progress <= this.crossfadeDuration &&
      !this.crossfadeTimer
    ) {
      // Only set up crossfade if we have more tracks and not in repeat-one mode
      if (
        this.queue.length > 1 &&
        this.repeatMode !== REPEAT_MODES.ONE &&
        (this.currentIndex < this.queue.length - 1 || this.repeatMode === REPEAT_MODES.ALL)
      ) {
        console.log("🔄 Setting up crossfade")
        this.crossfadeTimer = setTimeout(() => {
          this._crossfadeToNext()
          this.crossfadeTimer = null
        }, 100)
      }
    }
  }

  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback)
    }
  }

  _notifyListeners() {
    const data = {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      isBuffering: this.isBuffering,
      progress: this.progress,
      duration: this.duration || 1, // Ensure duration is never 0 to avoid division by zero
      queue: this.queue,
      currentIndex: this.currentIndex,
      repeatMode: this.repeatMode,
      shuffleMode: this.shuffleMode,
      volume: this.volume,
      playbackSpeed: this.playbackSpeed,
    }
    this.listeners.forEach((fn) => fn(data))
  }

  // Liked songs management
  async getLikedSongs() {
    try {
      const likedSongsJson = await AsyncStorage.getItem(STORAGE_KEYS.LIKED_SONGS)
      return likedSongsJson ? JSON.parse(likedSongsJson) : []
    } catch (err) {
      console.error("❌ Error getting liked songs:", err.message)
      return []
    }
  }

  async toggleLike(track) {
    try {
      const likedSongs = await this.getLikedSongs()
      const isLiked = likedSongs.some((t) => t.id === track.id)

      let updatedLikedSongs
      if (isLiked) {
        // Remove from liked songs
        updatedLikedSongs = likedSongs.filter((t) => t.id !== track.id)
        console.log("💔 Removed from liked songs:", track.title)
      } else {
        // Add to liked songs
        updatedLikedSongs = [...likedSongs, track]
        console.log("❤️ Added to liked songs:", track.title)
      }

      await AsyncStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(updatedLikedSongs))
      return !isLiked // Return new liked state
    } catch (err) {
      console.error("❌ Error toggling like:", err.message)
      return null
    }
  }

  async isTrackLiked(trackId) {
    try {
      const likedSongs = await this.getLikedSongs()
      return likedSongs.some((t) => t.id === trackId)
    } catch (err) {
      console.error("❌ Error checking if track is liked:", err.message)
      return false
    }
  }
}

export default new AudioPlayer()

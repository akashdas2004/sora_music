import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEYS = {
  PLAYLISTS: "@music_app/playlists",
}

class PlaylistManager {
  constructor() {
    this.playlists = []
    this._loadPlaylists()
  }

  async _loadPlaylists() {
    try {
      const playlistsJson = await AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS)
      if (playlistsJson) {
        this.playlists = JSON.parse(playlistsJson)
        console.log("📂 Loaded", this.playlists.length, "playlists from storage")
      } else {
        // Initialize with default playlists if none exist
        this.playlists = [
          { id: "1", name: "Favorites", tracks: [], createdAt: Date.now() },
          { id: "2", name: "Recently Played", tracks: [], createdAt: Date.now() },
        ]
        this._savePlaylists()
      }
    } catch (err) {
      console.error("❌ Error loading playlists:", err.message)
      this.playlists = []
    }
  }

  async _savePlaylists() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(this.playlists))
    } catch (err) {
      console.error("❌ Error saving playlists:", err.message)
    }
  }

  async getPlaylists() {
    if (this.playlists.length === 0) {
      await this._loadPlaylists()
    }
    return this.playlists
  }

  async createPlaylist(name) {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: Date.now(),
    }

    this.playlists.push(newPlaylist)
    await this._savePlaylists()
    console.log("✅ Created new playlist:", name)
    return newPlaylist
  }

  async deletePlaylist(playlistId) {
    this.playlists = this.playlists.filter((p) => p.id !== playlistId)
    await this._savePlaylists()
    console.log("🗑️ Deleted playlist:", playlistId)
  }

  async renamePlaylist(playlistId, newName) {
    const playlist = this.playlists.find((p) => p.id === playlistId)
    if (playlist) {
      playlist.name = newName
      await this._savePlaylists()
      console.log("✏️ Renamed playlist to:", newName)
      return true
    }
    return false
  }

  async addTrackToPlaylist(playlistId, track) {
    const playlist = this.playlists.find((p) => p.id === playlistId)
    if (playlist) {
      // Check if track already exists
      const exists = playlist.tracks.some((t) => t.id === track.id)
      if (!exists) {
        playlist.tracks.push(track)
        await this._savePlaylists()
        console.log("➕ Added track to playlist:", playlist.name)
        return true
      }
    }
    return false
  }

  async removeTrackFromPlaylist(playlistId, trackId) {
    const playlist = this.playlists.find((p) => p.id === playlistId)
    if (playlist) {
      playlist.tracks = playlist.tracks.filter((t) => t.id !== trackId)
      await this._savePlaylists()
      console.log("➖ Removed track from playlist:", playlist.name)
      return true
    }
    return false
  }

  async getPlaylistTracks(playlistId) {
    const playlist = this.playlists.find((p) => p.id === playlistId)
    return playlist ? playlist.tracks : []
  }

  // Special method for Recently Played playlist
  async addToRecentlyPlayed(track) {
    const recentlyPlayed = this.playlists.find((p) => p.name === "Recently Played")
    if (recentlyPlayed) {
      // Remove if already exists
      recentlyPlayed.tracks = recentlyPlayed.tracks.filter((t) => t.id !== track.id)

      // Add to beginning
      recentlyPlayed.tracks.unshift(track)

      // Limit to 50 tracks
      if (recentlyPlayed.tracks.length > 50) {
        recentlyPlayed.tracks = recentlyPlayed.tracks.slice(0, 50)
      }

      await this._savePlaylists()
    }
  }
}

export default new PlaylistManager()

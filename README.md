##🎵 SoraMusic

SoraMusic is a modern and minimal cross-platform music streaming app built with **React Native (Expo)**. It uses a **Flask backend** to stream full tracks from YouTube (via `yt-dlp`) and fetch music metadata from **Spotify** and **JioSaavn**.

---

## 🚀 Features

- 🔍 **Search Songs** using YouTube Music
- 🎧 **Full Track Streaming** (via yt-dlp + Flask backend)
- 💿 **Now Playing Screen** with progress bar, artwork, and animations
- 🎚️ **Mini Player** with swipe-to-expand and playback controls
- 📡 **Spotify Metadata**: Artist, Album, Playlist info
- 🎵 **JioSaavn Playlists** for curated content on the home screen
- 📱 Built with **React Native (Expo)** — runs on both Android & iOS

---

## 🛠️ Tech Stack

### Frontend:
- React Native + Expo
- expo-av (for audio playback)
- React Navigation
- Animated MiniPlayer

### Backend:
- Flask
- yt-dlp (for streaming audio)
- ytmusicapi (for YouTube Music search)
- JioSaavnPro API (unofficial)
- Spotify Web API (for metadata)

---

## 📦 Installation

### 📱 Frontend

```bash
git clone https://github.com/akashdas2004/sora_music.git
cd sora_music
npm install
npx expo start

## 🖥️  Backend
cd backend
pip install -r requirements.txt
python app.py

🔗 API Usage
GET /search?query=... → Search for songs via YouTube Music

GET /stream?video_id=... → Stream a YouTube audio

GET /playlist?link=... → Fetch JioSaavn playlist

GET /spotify/... → Metadata from Spotify (genre, artist, etc.)

✨ Screenshots (Coming Soon)
Home screen with playlists

Now Playing screen

Search results

Mini Player

📄 License
MIT License

👨‍💻 Author
Built with ❤️ by Akash Das

"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"

// Screens
import HomeScreen from "./screens/HomeScreen"
import SearchScreen from "./screens/SearchScreen"
import LibraryScreen from "./screens/LibraryScreen"
import NowPlayingScreen from "./screens/NowPlayingScreen"
import MiniPlayer from "./components/MiniPlayer"


// Audio player
import audioPlayer from "./audioPlayer"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const MainTabs = ({ playTrack, currentTrack, isPlaying, progress, duration, navigateToNowPlaying }) => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline"
            } else if (route.name === "Search") {
              iconName = focused ? "search" : "search-outline"
            } else if (route.name === "Library") {
              iconName = focused ? "library" : "library-outline"
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: "#1DB954",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#121212",
            borderTopColor: "#333",
            height: currentTrack ? 50 : 80, // Adjust height when MiniPlayer is visible
            paddingBottom: currentTrack ? 0 : 15,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home">{(props) => <HomeScreen {...props} playTrack={playTrack} />}</Tab.Screen>
        <Tab.Screen name="Search">{(props) => <SearchScreen {...props} playTrack={playTrack} />}</Tab.Screen>
        <Tab.Screen name="Library">{(props) => <LibraryScreen {...props} playTrack={playTrack} />}</Tab.Screen>
      </Tab.Navigator>

      {currentTrack && (
        <TouchableOpacity activeOpacity={0.9} onPress={navigateToNowPlaying}>
          <MiniPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            duration={duration}
            navigateToNowPlaying={navigateToNowPlaying}
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default function App() {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)

  useEffect(() => {
    // Listen for audio player updates
    const unsubscribe = audioPlayer.addListener(({ currentTrack, isPlaying, progress, duration, isBuffering }) => {
      setCurrentTrack(currentTrack)
      setIsPlaying(isPlaying)
      setProgress(progress)
      setDuration(duration || 1)
      setIsBuffering(isBuffering)
    })

    return () => unsubscribe()
  }, [])

  const playTrack = (track, navigation) => {
    // If we're already playing this track, just navigate to now playing
    if (currentTrack?.id === track.id && navigation) {
      navigation.navigate("NowPlaying", { track })
      return
    }

    // Otherwise play the track
    audioPlayer.play(track)
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: "#121212" },
            }}
          >
            <Stack.Screen name="Main">
              {(props) => (
                <MainTabs
                  {...props}
                  playTrack={playTrack}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  progress={progress}
                  duration={duration}
                  navigateToNowPlaying={() => props.navigation.navigate("NowPlaying", { track: currentTrack })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="NowPlaying" component={NowPlayingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
})

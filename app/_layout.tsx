import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Slot, Stack } from 'expo-router'
import "../global.css";
import { StatusBar } from 'expo-status-bar'
import { GlobalProvider } from '../Context/GlobalProvider';

const RootLayout = () => {
  return ( 
    /* GlobalProvider is what allows the app the access user data from any page.
    It is used in index for example to check if the user is already logged in.
    It can be found in /context */
    <GlobalProvider>
      <Stack>
          <Stack.Screen name='index' options={{ headerShown: false}} />
          <Stack.Screen name='(auth)' options={{ headerShown: false}} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name='profile' options={{ headerShown: false, gestureEnabled: false}} />
          <Stack.Screen name='landing' options={{ headerShown: false, gestureEnabled: false}} />
          <Stack.Screen name='join-room' options={{ headerShown: false}} />
          <Stack.Screen name='create-room' options={{ headerShown: false}} />
          <Stack.Screen name='room-settings' options={{ headerShown: false}} />
          <Stack.Screen name='profile-settings' options={{ headerShown: false}} />
      </Stack>
      <StatusBar backgroundColor='#161622' style='dark'/>
    </GlobalProvider>
  )
}

export default RootLayout


import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useGlobalContext } from '../Context/GlobalProvider';
import { signOutUser } from '../db/firestore';

export default function App() {
  //These are taken from the GlobalProider. Are used to check if the user is logged in.
  const { isLoading, isLoggedIn, user } = useGlobalContext();

  // Redirect logic based on user state
  useEffect(() => {
    if(user){
      if (!isLoading) {
        if (isLoggedIn) {
          if (user?.roomId) {
            router.replace('/profile'); // Redirect to profile if user is in a room
          } else {
            router.replace('/landing'); // Redirect to landing if user is not in a room
          }
        }
      }
    }
  }, [user])
  

  
  if (isLoading){
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#C0C0C0" />
        <Text className="mt-4 text-lg text-gray-700">Loading...</Text>
      </View>
    )
  }
    else{
  return (
    <SafeAreaView className="bg-gray-50 h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 py-8">
          {/* Logo or Title */}
          <Text className="text-3xl font-bold text-gray-800">Roomspace</Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            The ultimate room management experience
          </Text>

          {/* Sign-In Button */}
          <CustomButton
            title="Sign In"
            handlePress={() => {
              router.push('/sign-in');
            }}
            containerStyles="w-full mt-8 bg-gray-900 py-4 rounded-lg shadow-md"
            textStyles="text-white text-base font-medium"
          />

          {/* Test-Location-Services Button (DELETE LATER) */}
          <CustomButton
            title="Test Location Services"
            handlePress={() => {
              router.push('/location');
            }}
            containerStyles="w-full mt-8 bg-gray-900 py-4 rounded-lg shadow-md"
            textStyles="text-white text-base font-medium"
          />

          {/* Footer */}
          <Text className="text-xs text-gray-500 mt-6 text-center">
            Don’t have an account? <Text className="text-gray-900 font-bold" onPress={() => router.push('/sign-up')}>Sign up now</Text>!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}
}
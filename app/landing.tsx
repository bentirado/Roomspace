import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, AntDesign, FontAwesome5, Octicons } from '@expo/vector-icons'; // Importing icons
import { signOutUser } from '../db/firestore';
import { router } from 'expo-router';
import CustomButton from '../components/CustomButton';
import { useGlobalContext } from '../Context/GlobalProvider';

// Function to handle user sign out
export const handleSignOut = async () => {
  Alert.alert(
    "Sign Out",
    "Are you sure you want to sign out?",
    [
      {
        text: "Cancel",
        style: 'cancel',
      },
      {
        text: "Sign Out",
        style: 'destructive',
        onPress: async () => {
          try {
            await signOutUser(); // Sign out the user
            router.replace('/'); // Navigate to the home page
          } catch (error) {
            console.error('Error signing out:', error);
          }
        },
      },
    ]
  );
};

const Landing = () => {
  const { isLoading, isLoggedIn, user, reloadUser } = useGlobalContext();
  

  if (isLoading){
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#C0C0C0" />
        <Text className="mt-4 text-lg text-gray-700">Loading...</Text>
      </View>
    )
  }
  else {
  return (
    <View className="flex-1 bg-white">
      {/* Header with Light Background and Border */}
      <View className="bg-white p-6 border-b border-gray-200 pt-10">
        <View className="flex-row justify-between items-center">
          <Text className="text-3xl text-gray-800 font-semibold">Roomspace</Text>

          {/* Profile and Sign Out Buttons */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity className="p-2 rounded-lg"
            onPress={() => {router.push('/profile-settings')}}
            >
              <FontAwesome5 name="user" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="p-2 rounded-lg"
              onPress={handleSignOut}
            >
              <Octicons name="sign-out" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center', 
          padding: 16,
          paddingBottom: 80, // Push content above bottom tabs
        }}
      >
        {/* Welcome Message */}
        <View className="mb-8">
          <Text className="text-xl text-gray-700 text-center">
            Welcome to Roomspace!
          </Text>
          <Text className="text-base text-gray-500 text-center mt-2">
            You can either join an existing room or create a new one. Let's get started!
          </Text>
        </View>

        {/* Buttons */}
        <View className="flex-col items-center gap-6 max-w-sm mx-auto">
          {/* Join a Room Button */}
          <CustomButton
          title="Join an Existing Room"
          handlePress={() => {
            router.push('/join-room');
          }}
          containerStyles="w-50 px-10 py-6 rounded-lg bg-gray-900 text-white shadow-sm hover:bg-gray-800 hover:shadow-md flex flex-row justify-start gap-4"
          textStyles="text-medium text-white font-medium"
          icon={<AntDesign name="team" size={24} color="white" />}
        />

          {/* Create a Room Button */}
          <CustomButton
          title="Create a New Room"
          handlePress={() => {
            router.push('/create-room');
          }}
          containerStyles="w-50 px-10 py-6 rounded-lg bg-gray-100 text-gray-900 font-medium shadow-sm hover:bg-gray-200 hover:shadow-md flex flex-row items-center justify-start gap-4"
          textStyles="text-medium text-gray-900 font-medium"
          icon={<AntDesign name="plus" size={24} color="gray" />}
        />
        </View>
      </ScrollView>

      {/* Bottom Tabs */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 flex-row justify-around">
        <TouchableOpacity
          className="flex items-center"
          onPress={() => {}}
        >
          <AntDesign name="home" size={24} color="black" />
          <Text className="text-sm text-gray-700 mt-1">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex items-center"
          onPress={() => {}}
        >
          <AntDesign name="bars" size={24} color="black" />
          <Text className="text-sm text-gray-700 mt-1">Lists</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
}

export default Landing;

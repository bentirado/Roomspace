import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { createRoom, generateRoomCode } from '../db/firestore';
import { useGlobalContext } from '../Context/GlobalProvider';
import { router } from 'expo-router';

const CreateRoom = () => {

  //These are taken from the GlobalProider. Are used to check if the user is logged in.
  const{ isLoggedIn, user, reloadUser, isLoading, setIsLoading} = useGlobalContext();

  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('ROOM-0516'); // Example static room code, generate dynamically in real usage

  // Redirect logic based on user state
  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        if (user?.roomId != '') {
          router.replace('/profile') // Redirect to profile if user is in a room
        }
      }
    }
  }, [user?.roomId])

  //Generate new room code
  useEffect(() => {
    const fetchCode = async () => {
      const newCode = await generateRoomCode();
      setRoomCode(newCode)
    }
    fetchCode();
  }, [])
  

  /* Hook for the form functions. This is a part of the react-hook-form api that we are using.
  It makes form validation easier and will allow us to scale up to more complicated forms much easier. */
  const {control, handleSubmit, formState: {errors}} = useForm();

  const handleCreateRoom = async (data) => {
    setIsLoading(true);
    await createRoom(data.roomName, roomCode, user);
    setIsLoading(false);
    reloadUser();
  };

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
    <View className="flex-1 px-6 py-10 bg-white">
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Page Title */}
      <Text className="text-3xl text-gray-800 font-semibold mb-8">Create a Room</Text>

      {/* Input Field */}
      <View className="w-full mt-5 mb-8 space-y-6">
        <CustomInput
                name="roomName"
                placeholder="Enter room name"
                control={control}
                rules={{
                  required: "Room name is required",
                  maxLength: {
                    value: 14,
                    message: "Room name cannot exceed 14 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9 ]+$/,
                    message: "Room name can only contain letters, numbers, and spaces",
                  },
                  validate: {
                    noLeadingOrTrailingWhitespace: (value) =>
                      value.trim() === value || "Room name cannot have leading or trailing spaces",
                  },
                }}
              />
      </View>

      {/* Room Code Display */}
      <View className="mb-2 bg-gray-100 rounded-lg px-4 py-3">
        <Text className="text-base text-gray-700">{roomCode}</Text>
      </View>
      <Text className="text-sm text-gray-500 mb-8">This is your unique room code</Text>

      {/* Create Room Button */}
      <CustomButton
          title="Create Room"
          handlePress={handleSubmit(handleCreateRoom)}
          containerStyles="w-50 px-10 py-6 rounded-lg bg-gray-900 text-white shadow-sm hover:bg-gray-800 hover:shadow-md flex flex-row justify-start gap-4"
          textStyles="text-medium text-white font-medium"
        />
    </View>
  );
};
}

export default CreateRoom;

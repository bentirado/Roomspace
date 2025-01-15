import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../Context/GlobalProvider';
import { joinRoom } from '../db/firestore';
import { router } from 'expo-router';

const JoinRoom = () => {
  const{user, isLoggedIn, reloadUser, isLoading, setIsLoading} = useGlobalContext();  

  const handleJoinRoom = async (data) => {
    setIsLoading(true);
    await joinRoom(data, user);
    setIsLoading(false);
    reloadUser();
    console.log("User joined room!")
  };

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

  /* Hook for the form functions. This is a part of the react-hook-form api that we are using.
  It makes form validation easier and will allow us to scale up to more complicated forms much easier. */
  const {control, handleSubmit, formState: {errors}} = useForm();

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

    <View className="flex-1 px-6 py-10 bg-white">
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View className='py-20'>
      {/* Title */}
      <Text className="text-3xl font-semibold text-gray-900 text-center mb-8">
        Join a Room
      </Text>
      {/* Input Field */}
      <View className="w-full mt-5 space-y-6">
        <CustomInput
                name="roomName"
                placeholder="Enter room name"
                control={control}
                rules={{ required: 'Room name is required' }}
              />
      </View>
      <View className="w-full mt-5 mb-8 space-y-6">
        <CustomInput
                name="roomCode"
                placeholder="XXXX-1234"
                control={control}
                rules={{
                  required: 'Room code is required',
                  pattern: {
                    value: /^[A-Z]{4}-\d{4}$/,
                    message: 'Room code must follow the format XXXX-1234',
                  },
                }} 
                             />
      </View>
      {/* Join Button */}
      <CustomButton
          title="Join Room"
          handlePress={handleSubmit(handleJoinRoom)}
          containerStyles="w-50 px-10 py-6 rounded-lg bg-gray-900 text-white shadow-sm hover:bg-gray-800 hover:shadow-md flex flex-row justify-start gap-4"
          textStyles="text-medium text-white font-medium"
        />

      {/* Instruction */}
      <Text className="text-sm text-gray-500 text-center mt-4">
        You can find the room code in the share menu of any room
      </Text>
      </View>
      </View>
  );
};
}

export default JoinRoom;

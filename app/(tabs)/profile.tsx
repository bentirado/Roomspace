import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { fetchRoomData, leaveRoom, setStatus, signOutUser } from '../../db/firestore';
import { router } from 'expo-router';
import Octicons from '@expo/vector-icons/Octicons';
import CustomButton from '../../components/CustomButton';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useGlobalContext } from '../../Context/GlobalProvider';

const Profile = () => {
  const { user, reloadUser, isLoading, setIsLoading } = useGlobalContext();
  const [members, setMembers] = useState([]); // State to hold the members data
  const [roomName, setRoomName] = useState('Loading...');
  const [roomCreator, setRoomCreator] = useState('');
  const [locationTracking, setLocationTracking] = useState(false); // State for location tracking
  const [roomDesc, setRoomDesc] = useState('')
  const [roomCode, setRoomCode] = useState('')
  

  const renderMember = ({ item }) => {
    if (user) {
      const isCurrentUser = item.id === user.uid; // Check if this is the current user

      return (
        <View
          className={`items-center mb-6 w-1/2 sm:w-1/3 lg:w-1/4`}
        >
          <View className="relative">
            <TouchableOpacity
              onPress={() => {
                if (item.id === user.uid) {
                  handleChangeStatus();
                }
                else {
                  handleShowStatus(item.name, item.status);
                }
              }}
            >
              <View
                className={`w-16 h-16 rounded-full bg-gray-50 items-center justify-center shadow-sm ${isCurrentUser ? 'border-4 border-gray-800' : ''
                  }`}
              >
                <AntDesign name="user" size={24} color="black" />
              </View>
            </TouchableOpacity>
            <View
              className={`absolute bottom-1 right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${item.status === 'home' ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
          </View>
          <View className="flex-row items-center mt-3 justify-start">
            {item.id === roomCreator && (
              <MaterialCommunityIcons
                name="crown"
                size={16}
                color="gold"
                className="mr-1"
              />
            )}
            <Text
              className={`text-sm font-medium`}
            >
              {item.name}
            </Text>
          </View>
          <Text className="text-xs text-gray-400 capitalize">{item.status}</Text>
        </View>
      );
    }
    else {
      console.log("Error, user auth not loaded. In profile.tsx. Adress this bug to fix the loading error?")
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      if (user?.roomId) {
        setIsLoading(true)
        console.log('Fetching room data...');
        console.log('User room id: ', user.roomId);
        await fetchRoomData(user, setRoomName, setMembers, setRoomCreator, setRoomCode, setRoomDesc);
        setIsLoading(false)
      }
    }
    fetchData();
  }, [user?.roomId != '']);

  const handleSignOut = async () => {
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

  const handleLeaveRoom = async (user, roomId) => {
    Alert.alert(
      'Are you sure?',
      'Are you sure you want to leave this room?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave Room',
          style: 'destructive',
          onPress: async () => {
            // Call your leaveRoom function if the user confirms
            setIsLoading(true)
            await leaveRoom(user, roomId);
            reloadUser();
            setIsLoading(false)
            router.replace('/landing'); // Navigate to landing page after leaving the room
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleChangeStatus = () => {
    Alert.alert(
      'Change Status',
      'Select a new status:',
      [
        { text: 'Home', onPress: async () => await setStatus(user, 'home') },
        { text: 'Away', onPress: async () => await setStatus(user, 'away') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleShowStatus = (name, status) => {
    Alert.alert(
      '', // Display the user's name or a fallback if no name is available
      `User: ${name || 'User'} \n \n Current Status: ${status || 'Unknown'} `,
      [
        { text: 'Cancel', style: 'cancel' }, // Cancel button
      ],
      { cancelable: true } // Make the alert dismissible
    );
  };

  const toggleLocationTracking = () => {
    setLocationTracking((prevState) => !prevState);
    console.log(locationTracking ? 'Location Tracking Disabled' : 'Location Tracking Enabled');
  };
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#C0C0C0" />
        <Text className="mt-4 text-lg text-gray-700">Loading...</Text>
      </View>
    )
  }
  else {
    return (
      <View className="flex-1 py-8 pt-5">
        <View className="flex-row justify-between items-center mb-8 border-b border-gray-200 p-6 bg-white">
          <View className='flex-row'>
            <Text className="text-3xl text-gray-800 font-semibold tracking-tight">{roomName || 'Undefined'}</Text>
            {/* Settings Icon */}
            {user && user.uid === roomCreator && (
              <TouchableOpacity
                className="flex-row items-center px-2 py-2 rounded-lg bg-gray-200 ml-4"
                onPress={() => router.push('/room-settings')} // Navigate to Room Settings
              >
                <MaterialCommunityIcons name="cog-outline" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>
          {/*Profile option and sign out button */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity className="p-2 rounded-lg" onPress={handleSignOut}>
              <Octicons name="sign-out" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <View className='px-4 py-3'>
        <TouchableOpacity>
          <View className="bg-gray-900 px-4 py-3 rounded-md shadow-sm mb-6">
            <Text className="text-lg text-white font-semibold">Welcome to {roomName},</Text>
            <Text className="text-xl text-white font-bold">{user?.name}</Text>
            <Text className="text-sm text-gray-300">
              {roomDesc}    </Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row justify-between mb-8 pb-5 border-b border-gray-200">
          <Text className="text-lg text-gray-800">Smart Status</Text>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg bg-gray-800"
            onPress={toggleLocationTracking}
          >
            <Text className="text-white">{locationTracking ? 'Turn Off' : 'Turn On'}</Text>
          </TouchableOpacity>
        </View>
        </View>
        <FlatList
          data={members.length > 0 ? members : [{}]} // Use an empty object to render "No members found" or members list
          renderItem={({ item, index }) => {
            if (members.length === 0 && index === 0) {
              return (
                <Text className="text-gray-500 text-center">No members found.</Text>
              );
            }
            return renderMember({ item });
          }}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,
          }}
          ListFooterComponent={
            <View className="flex-row justify-end mb-8 mt-8 px-4">
              <CustomButton
                title="Leave Room"
                handlePress={() => {
                  handleLeaveRoom(user, user?.roomId);
                }}
                containerStyles="w-full mt-2 bg-gray-200 py-4 rounded-lg"
                textStyles="text-gray-700 text-base font-medium"
              />
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
};

export default Profile;

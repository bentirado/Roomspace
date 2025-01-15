import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useGlobalContext } from '../Context/GlobalProvider';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { useForm } from 'react-hook-form';
import { deleteRoom, fetchRoomData, generateRoomCode, removeUserFromRoom, updateRoom, updateRoomCode } from '../db/firestore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const RoomSettings = () => {
  const { setValue, control, handleSubmit, formState: { errors } } = useForm();
  const { user, isLoading, setIsLoading, reloadUser } = useGlobalContext();
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [roomCreator, setRoomCreator] = useState('');
  const [locationTracking, setLocationTracking] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  
  const [members, setMembers] = useState([
    { id: '1', name: 'Alice', status: 'home' },
    { id: '2', name: 'Bob', status: 'away' },
    { id: '3', name: 'Charlie', status: 'home' },
  ]);

  const handleSaveSettings = async (data) => {
    await updateRoom(user, user.roomId, data.roomName, data.roomDesc)
  };

  const handleDeleteRoom = () => {
    Alert.alert(
      'Delete Room',
      'Are you sure you want to delete this room? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () =>
           await deleteRoomReload() },
      ]
    );
  };

  const deleteRoomReload = async () => {
    setIsLoading(true)
    await deleteRoom(user, user.roomId)
    setIsLoading(false)
    reloadUser();
    console.log('User Reloaded.')
  }

  const handleGenerateNewCode = () => {
    Alert.alert(
      "Generate New Room Code",
      "Are you sure you want to generate a new room code? \n \n This will replace the existing code.",
      [
        {
          text: "Cancel",
          style: 'cancel',
          onPress: () => {},
        },
        {
          text: "Generate",
          style: "default",
          onPress: async () => {
            const newCode = await generateRoomCode();
            await updateRoomCode(user, user.roomId, newCode)
            setRoomCode(newCode);
            console.log("New code generated:", newCode);
          },
        },
      ]
    );
  };

  const handleMemberPress = (memberId, memberName) => {
    if (memberId != user.uid) {
    Alert.alert(
      'Manage Member',
      `What would you like to do with ${memberName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeUserFromRoom(user, memberId, user.roomId)
          },
        },
      ]
    );
  }
  };

  useEffect(() => {
    const fetchData = async () => {
      if(user?.roomId) {
        setIsLoading(true)
        await fetchRoomData(user, setRoomName, setMembers, setRoomCreator, setRoomCode, setRoomDesc);
        setIsLoading(false)
      }
    }
    fetchData();
  }, [user?.roomId != '']);

  //This line is used because react-hook-form wasn't updating correctly and would pass undefined to roomName.
  useEffect(() => {
    setValue('roomName', roomName || 'Undefined');
    setValue('roomDesc', roomDesc || 'No description provided');
  }, [roomName, roomDesc, setValue]);

  const renderMember = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMemberPress(item.id, item.name)}
      className="flex-row justify-between items-center bg-gray-100 px-4 py-3 mb-2 rounded-lg"
    >
      {/* Crown Icon for Room Creator */}
      {item.id === roomCreator && (
        <MaterialCommunityIcons
          name="crown"
          size={16}
          color="gold"
          className="mr-2" // Increased margin-right for better spacing
        />
      )}
  
      {/* Member Name */}
      <Text className="text-gray-800 font-medium mr-2 flex-1">{item.name}</Text> 
  
      {/* Member Status (aligned to the right) */}
      <Text className={`text-sm ${item.status === 'home' ? 'text-green-600' : 'text-red-600'} text-right`}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );
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
    <View className="flex-1 px-4 py-8 bg-gray-50 pt-10">
        {/* Header */}
        <View className='flex-row border-b border-gray-200'>
        <TouchableOpacity onPress={() => router.back()} className="mr-4 pt-1">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl text-gray-800 font-semibold tracking-tight">Room Settings</Text>
        </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

        {/* Room Name Setting */}
        <View className="mb-6 pt-6">
          <Text className="text-lg text-gray-800 mb-2">Room Name</Text>
            <CustomInput
                name="roomName"
                placeholder={roomName || 'Undefined'}
                defaultValue={roomName || 'Undefined'}
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

        {/* Room Description Setting */}
        <View className="mb-6">
          <Text className="text-lg text-gray-800 mb-2">Room Description</Text>
          <CustomInput
                name="roomDesc"
                placeholder={roomDesc || 'Undefined'}
                defaultValue={roomDesc || 'Undefined'}
                control={control}
                rules={{
                  maxLength: {
                    value: 150,
                    message: "Description cannot exceed 150 characters",
                  },
                  validate: {
                    noLeadingOrTrailingWhitespace: (value) =>
                      value.trim() === value || "Description cannot have leading or trailing spaces",
                  },
                }}
            />
        </View>

        {/* Notifications Toggle */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg text-gray-800">Placeholder Switch</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#ccc', true: '#4ade80' }}
            thumbColor={notificationsEnabled ? '#059669' : '#f4f4f5'}
          />
        </View>
        {/* Save Button */}
        <CustomButton
          title="Save Changes"
          handlePress={handleSubmit(handleSaveSettings)}
          containerStyles="w-full py-4 bg-gray-900 rounded-lg mb-6"
          textStyles="text-white text-lg font-medium"
        />
        
        {/* Member List */}
        <View>
          {members.map((member) => (
            <View key={member.id}>
              {renderMember({ item: member })}
            </View>
          ))}
        </View>
      {/* Room Code Display */}
      <View className="flex-row justify-between items-center mb-2 mt-5 w-full pb-5">
          <View className="bg-gray-100 rounded-lg px-4 py-3 flex-1 mr-2">
              <Text className="text-xl text-gray-700 text-center">{roomCode || 'Code Not Found'}</Text>
          </View>
          <CustomButton
              title="Generate New Code"
              handlePress={handleGenerateNewCode}
              containerStyles="py-2 px-4 bg-gray-900 rounded-lg w-48"
              textStyles="text-white text-sm font-medium"
          />
      </View>
        {/* Delete Room Button */}
        <CustomButton
          title="Delete Room"
          handlePress={handleDeleteRoom}
          containerStyles="w-full py-4 bg-red-100 rounded-lg"
          textStyles="text-red-500 text-lg font-medium"
        />
      </ScrollView>
    </View>
  );
};
}
export default RoomSettings;

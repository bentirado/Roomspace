import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { AntDesign, Ionicons, Octicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { useForm } from 'react-hook-form';
import { changePassword, signOutUser, updateUser, userDelete } from '../../db/firestore';
import { router } from 'expo-router';
import { useGlobalContext } from '../../Context/GlobalProvider';

const ProfileSettings = () => {
  const { control, handleSubmit, reset } = useForm();
  const { user, isLoading, setIsLoading } = useGlobalContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setisChangePasswordModalVisible] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  
  const handleSaveSettings = async (data) => {
    updateUser(user, data.userName);
  };

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
  

  useEffect(() => {
    setIsLoading(true)
    setUserName(user.name)
    setUserEmail(user.email)
    console.log(user)
    setIsLoading(false)
  }, []);

  //Function makes the popup for delete user show up.
  const handleDeleteAccount = () => {
    setDeleteModalVisible(true); // Show the password input modal
  };
  
  //Called within the popup for delete user.
  const handlePasswordSubmit = async (data) => {
    await userDelete(user, data.password);
    setDeleteModalVisible(false); // Close the modal
  };

  //Function makes the popup for change password show up.
  const handleChangePassword = () => {
    setisChangePasswordModalVisible(true);
  }
  //Called within the popup for change password.
  const handleSavePassword = async (data) => {
    await changePassword(data.oldPassword, data.newPassword);
    setisChangePasswordModalVisible(false); // Close the modal
  }
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
    <View className="flex-1 px-4 py-8 pt-5">
      {/* Header */}
        <View className="flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 pt-6 mr-2">
            {/* Back Button and Title */}
            <View className="flex-row items-center">
            <Text className="text-2xl text-gray-800 font-semibold tracking-tight">Profile Settings</Text>
            </View>

            {/* Sign-out Button */}
            <TouchableOpacity className="p-2 rounded-lg" onPress={handleSignOut}>
            <Octicons name="sign-out" size={24} color="black" />
            </TouchableOpacity>
        </View>


      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Username Setting */}
        <View className="mb-6 pt-6">
          <Text className="text-lg text-gray-800 mb-2">Username</Text>
          <CustomInput
            name="userName"
            placeholder={user.name || 'Undefined'}
            defaultValue={user.name || 'Undefined'}
            control={control}
            rules={{
              required: "Name is required",
              maxLength: {
                value: 14,
                message: "Name cannot exceed 14 characters",
              },
              pattern: {
                value: /^[a-zA-Z0-9 ]+$/,
                message: "Name can only contain letters, numbers, and spaces",
              },
              validate: {
                noLeadingOrTrailingWhitespace: (value) =>
                  value.trim() === value || "Name cannot have leading or trailing spaces",
              },
            }} 
          />
        </View>

        {/* User Email Setting */}
        <View className="mb-6">
          <Text className="text-lg text-gray-800 mb-2">Email</Text>
          <View className="bg-gray-100 rounded-lg px-4 py-3 flex-1 mr-2">
            <Text className="text-xl text-gray-700 text-center">{userEmail || 'Email not found'}</Text>
          </View>
        </View>

        {/* Notifications Toggle */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-lg text-gray-800">Enable Notifications</Text>
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

        {/* Change Password */}
        <CustomButton
          title="Change Password"
          handlePress={handleChangePassword}
          containerStyles="w-full py-4 bg-gray-700 rounded-lg mb-6"
          textStyles="text-white text-lg font-medium"
        />

        {/* Delete Account Button */}
        <CustomButton
          title="Delete Account"
          handlePress={handleDeleteAccount}
          containerStyles="w-full py-4 bg-red-100 rounded-lg"
          textStyles="text-red-500 text-lg font-medium"
        />
      </ScrollView>

      {/* Delete Modal */}
      <Modal visible={isDeleteModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center">
          <View className="w-11/12 bg-white p-6 rounded-lg border-2 border-gray-300">
            <Text className="text-lg font-bold text-gray-800 mb-4 text-center">Confirm Account Deletion</Text>
            <Text className="text-gray-600 mb-6 text-center">
              Please re-enter your password to confirm account deletion.
            </Text>
            <CustomInput
              name="password"
              control={control}
              secureTextEntry={true}
              rules={{
                required: 'Password is required',
              }}
            />
            <View className="flex-row justify-between pt-6">
              <TouchableOpacity
                onPress={() =>  { 
                  setDeleteModalVisible(false); 
                  reset({ password: '' }); // Reset the password field when the modal is closed
                }}
                className="py-3 px-6 bg-gray-300 rounded-lg"
              >
                <Text className="text-black text-lg font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit(handlePasswordSubmit)}
                className="py-3 px-6 bg-red-500 rounded-lg"
              >
                <Text className="text-white text-lg font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={isChangePasswordModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 justify-center items-center">
          <View className="w-11/12 bg-white p-6 rounded-lg border-2 border-gray-300">
            <Text className="text-lg font-bold text-gray-800 mb-4 text-center">Change Password</Text>
            <View>
              <Text>Current Password:</Text>
            <CustomInput
              name="oldPassword" 
              control={control}
              secureTextEntry={true}
              rules={{
                required: 'Password is required',
              }}
            />
            </View>
            <View>
            <Text>New Password:</Text>
            <CustomInput
              name="newPassword" 
              control={control}
              secureTextEntry={true}
              rules={{
                required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
              }}
            />
            </View>


            <View className="flex-row justify-between pt-6">
              <TouchableOpacity
                onPress={() => { 
                  setisChangePasswordModalVisible(false) 
                  reset({ oldPassword: '', newPassword: '' }); // Reset the password field when the modal is closed
                }}
                className="py-3 px-6 bg-gray-300 rounded-lg"
              >
                <Text className="text-black text-lg font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit(handleSavePassword)}
                className="py-3 px-6 bg-red-500 rounded-lg"
              >
                <Text className="text-white text-lg font-medium">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
}

export default ProfileSettings;

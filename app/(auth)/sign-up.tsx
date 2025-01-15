import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { Redirect, router } from 'expo-router';
import { useGlobalContext } from '../../Context/GlobalProvider';
import { signUp } from '../../db/firestore';

const SignUp = () => {
  const { isLoading, isLoggedIn, user, setIsLoading } = useGlobalContext();

  // Redirect logic based on user state
  if (!isLoading) {
    if (isLoggedIn) {
      if (user?.roomId) {
        return <Redirect href="/profile" />; // Redirect to profile if user is in a room
      } else {
        return <Redirect href="/landing" />; // Redirect to landing if user is not in a room
      }
    }
  }

  const { control, handleSubmit, formState: { errors } } = useForm();

  const handleSignUp = async (data) => {
    setIsLoading(true);
    await signUp(data);
    setIsLoading(false);
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-6 py-10">
          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900">Create an Account</Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            Sign up for Roomspace to start managing your rooms effortlessly
          </Text>

          {/* Form Inputs */}
          <View className="w-full mt-8 space-y-6">
            <View>
              <CustomInput
                name="name"
                placeholder="Name"
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
            <View className="mt-2">
              <CustomInput
                name="email"
                placeholder="Email"
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                    message: 'Enter a valid email address',
                  },
                }}
              />
            </View>
            <View className="mt-2">
              <CustomInput
                name="password"
                placeholder="Password"
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
          </View>

          {/* Sign-Up Button */}
          <CustomButton
            title="Sign Up"
            handlePress={handleSubmit(handleSignUp)}
            containerStyles="w-full mt-8 bg-gray-900 py-4 rounded-lg shadow-md"
            textStyles="text-white text-base font-medium"
          />

          {/* Sign In Redirect */}
          <Text className="text-xs text-gray-500 mt-8 text-center">
            Already have an account?{' '}
            <Text
              className="text-gray-900 font-bold"
              onPress={() => router.push('/sign-in')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;

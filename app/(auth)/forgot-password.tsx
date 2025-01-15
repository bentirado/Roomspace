import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import CustomButton from '../../components/CustomButton'; // Importing your CustomButton component
import CustomInput from '../../components/CustomInput';
import { router } from 'expo-router';
import { sendPasswordReset } from '../../db/firestore';
import { useGlobalContext } from '../../Context/GlobalProvider';
import { Ionicons } from '@expo/vector-icons';

const ForgotPassword = () => {
    //These are taken from the GlobalProider. Are used to check if the user is logged in.
    const { isLoading, isLoggedIn, user } = useGlobalContext();

    /* Hook for the form functions. This is a part of the react-hook-form api that we are using.
    It makes form validation easier and will allow us to scale up to more complicated forms much easier. */
    const { control, handleSubmit, formState: { errors } } = useForm();

    // Redirect logic based on user state
    useEffect(() => {
        if (!isLoading) {
            if (isLoggedIn) {
                if (user?.roomId) {
                    router.replace('/profile') // Redirect to profile if user is in a room
                } else {
                    router.replace('/landing') // Redirect to landing if user is not in a room
                }
            }
        }
    }, [user?.roomId])



    /* Function is called when the 'sign-in' button is pressed. 
    It recieves 'data' from the handleSubmit() function which is a part of the react-hook-form. */
    const handleForgotPassword = async (data) => {
        const message = await sendPasswordReset(data.email.trim());
        router.replace('/');   
    }

    return (
        <SafeAreaView className="flex-1 px-4 py-8 bg-gray-50 pt-5">
            {/* Header */}
            <View className="flex-row border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 pb-3">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 justify-center items-center px-6 py-10">
                    {/* Title */}
                    <Text className="text-3xl font-bold text-gray-900">Forgot your password?</Text>
                    <Text className="text-base text-gray-600 mt-2 text-center">
                        Enter your email address to get instructions to reset your password.
                    </Text>

                    {/* Form Inputs */}
                    <View className="w-full mt-8 space-y-6">
                        <View>
                            {/* CustomInput can be found in the /components directory. 
            It is an abstraction of the react-hook-form that I did to make things more readable.
            The styling is currently fixed which I plan to change. */}
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
                    </View>

                    {/* Sign-In Button. This is also found in /components.*/}
                    <CustomButton
                        title="Submit"
                        handlePress={handleSubmit(handleForgotPassword)}
                        containerStyles="w-full mt-8 bg-black py-4 rounded-lg shadow-md"
                        textStyles="text-white text-base font-medium"
                    />

                    {/* Forgot Password */}
                    <TouchableOpacity
                        onPress={() => {
                            router.push('/forgot-password')
                        }}
                    >
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ForgotPassword;

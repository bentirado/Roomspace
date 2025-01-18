import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useLocation from "../../hooks/useLocation";

const Location = () => {
    const { latitude, longitude, geocode, errorMsg } = useLocation();

    
    

    // Loading state
    if (!latitude || !longitude) {
        return (
            <SafeAreaView className="bg-gray-50 h-full justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </SafeAreaView>
        );
    }

    // Error state
    if (errorMsg) {
        console.log(errorMsg);
        return (
            <SafeAreaView className="bg-gray-50 h-full justify-center items-center">
                <Text className="text-red-500">Error: {errorMsg}</Text>
            </SafeAreaView>
        );
    }

    // Geocode result state
    const locationInfo = geocode?.[0];

    if (!locationInfo) {
        return (
            <SafeAreaView className="bg-gray-50 h-full justify-center items-center">
                <Text className="text-red-500">Unable to fetch location details.</Text>
            </SafeAreaView>
        );
    }

    const { city, country, name } = locationInfo;

    return (
        <SafeAreaView className="bg-gray-50 h-full">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 justify-center items-center px-6 py-8">
                    <Text className="text-3xl font-bold text-black">Your location:</Text>
                    <Text className="text-base text-gray-600 mt-2 text-center">
                        (long,lat) = ({longitude}, {latitude})
                    </Text>
                    <Text className="text-base text-gray-600 mt-2 text-center">
                        Country: {country}
                    </Text>
                    <Text className="text-base text-gray-600 mt-2 text-center">
                        City: {city}
                    </Text>
                    <Text className="text-base text-gray-600 mt-2 text-center">
                        Address: {name}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Location;

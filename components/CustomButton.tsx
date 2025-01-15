import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { opacity } from 'react-native-reanimated/lib/typescript/Colors'

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading, icon}) => {
  return (
    <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        className={`rounded-xl min-h-[50px] justify-center items-center
            ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}   
        disabled={isLoading}
    >
       {icon && (
        <View className="ml-1">{icon}</View>
      )}
      <Text className={`text-lg ${textStyles}`}>{title}</Text>
    </TouchableOpacity>
  )
}

export default CustomButton
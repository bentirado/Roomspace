import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { Controller } from 'react-hook-form'

const CustomInput = ({control, placeholder, name, secureTextEntry=false, rules={}, defaultValue='', formatter}) => {
  return (
    //This file is the component for the react-hook-form. The documentation is a little complicated.
    <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
          <>
          <View> 
            <TextInput value={value} 
                onChangeText={(text) => onChange(formatter ? formatter(text) : text)} //This line allows a formating function to be added.
                onBlur={onBlur} placeholder={placeholder}
                placeholderTextColor="gray"
                //This line will change the border to red if there is an error in the authentication.
                className={`bg-gray-50 py-3 text-lg w-full px-4 py-2 text-base text-gray-900 bg-white border ${error ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`} 
                  secureTextEntry={secureTextEntry}
                    />
          </View>
          {error && (
              <Text className='text-red-600'>{error.message || 'Error'}</Text>
          )}
          </>
                    )}
      />
  )
}

export default CustomInput
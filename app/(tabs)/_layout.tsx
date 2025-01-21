import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
        tabBarActiveTintColor: 'black',
        tabBarStyle: {
            height: 60, 
          },
          tabBarIconStyle: {
            marginTop: 5, // Adjust this to vertically center the icon
          },
     }}>
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <AntDesign size={28} name="home" color={color} />,
          headerShown: false
        }}
      />
        <Tabs.Screen
        name="profile-settings"
        options={{
          title: 'Auto Status',
          tabBarIcon: ({ color }) => <FontAwesome5 size={24} name="map" color={color} />,
          headerShown: false
        }}
      />
      
    </Tabs>
  );
}

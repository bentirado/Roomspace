import React from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import useGeofencing from "../../hooks/useGeofencing";
import useLocation from "../../hooks/useLocation";

const Location = () => {
  const { geofenceStatus, errorMsg: geofencingError } = useGeofencing();
  const { latitude, longitude, geocode, errorMsg: locationError } = useLocation();

  // Display any error messages
  if (geofencingError || locationError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {geofencingError || locationError}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        {/* Geofencing Status */}
        <Text style={styles.title}>Geo-fence Status:</Text>
        <Text style={styles.value}>
          {geofenceStatus ? geofenceStatus : "Waiting for geofence events..."}
        </Text>
      </View>
      
      <View style={styles.section}>
        {/* Current Location */}
        <Text style={styles.title}>Current Location:</Text>
        {latitude && longitude ? (
          <Text style={styles.value}>
            Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.value}>Fetching location...</Text>
        )}
      </View>

      <View style={styles.section}>
        {/* Geocode (Address) */}
        <Text style={styles.title}>Address:</Text>
        {geocode && geocode[0] ? (
          <Text style={styles.value}>
            {geocode[0].street}, {geocode[0].city}, {geocode[0].region} - {geocode[0].postalCode}
          </Text>
        ) : (
          <Text style={styles.value}>Fetching address...</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Location;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  section: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

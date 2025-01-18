import { useEffect, useState } from "react";
import * as Location from "expo-location";

const useLocation = () => {
    const [errorMsg, setErrorMsg] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [geocode, setGeocode] = useState({});
    
    useEffect(() => {
        const getUserLocation = async () => {
            // Request location permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            // Watch for position changes
            const locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000, // update every 10 seconds
                    distanceInterval: .5 // update if the location changes by 10 meters
                },
                async (location) => {
                    const { latitude, longitude } = location.coords;
                    setLatitude(latitude);
                    setLongitude(longitude);

                    // Reverse geocode location to get address details
                    const geocodeData = await Location.reverseGeocodeAsync({
                        latitude,
                        longitude,
                    });
                    setGeocode(geocodeData);
                    
                }
            );

            // Clean up subscription on component unmount
            return () => locationSubscription.remove();
        };

        getUserLocation();
    }, []); // Runs only once after the initial render

    return { latitude, longitude, geocode, errorMsg };
};

export default useLocation;

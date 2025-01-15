import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import * as Location from "expo-location";

const useLocation = () => {
    const [errorMsg, setErrorMsg] = useState("");
    const [longitude, setLongitude] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [geocode, setGeocode] = useState({});

    useEffect(() => {
        const getUserLocation = async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            let { coords } = await Location.getCurrentPositionAsync();
            if (coords) {
                const { latitude, longitude } = coords;
                setLatitude(latitude);
                setLongitude(longitude);

                let geocode = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });

                setGeocode(geocode)
            }
        };

        getUserLocation();
    }, []); // Runs only once after the initial render

    return { latitude, longitude, geocode, errorMsg };
};

export default useLocation;
const styles = StyleSheet.create({});
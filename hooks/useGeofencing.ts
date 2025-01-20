import { useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

// Define the geofence task name
const GEO_FENCE_TASK_NAME = "geo-fence-task";

type GeofenceEvent = {
  type: "ENTER" | "EXIT";
  region: Location.GeofencingRegion;
};

const useGeofencing = () => {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [geofenceStatus, setGeofenceStatus] = useState<string | null>(null);

  useEffect(() => {
    const setupGeofence = async () => {
      console.log("Requesting foreground location permissions...");
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        const message = "Foreground permission to access location was denied.";
        console.error(message);
        setErrorMsg(message);
        return;
      }

      console.log("Requesting background location permissions...");
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== "granted") {
        const message = "Background permission to access location was denied.";
        console.error(message);
        setErrorMsg(message);
        return;
      }

      const geofenceRegion = {
        latitude: 35.197592, // Example: Adjust to your needs
        longitude: -97.431456,
        radius: 10, // 100 meters
      };

      console.log("Starting geofencing with the following region:", geofenceRegion);

      try {
        await Location.startGeofencingAsync(GEO_FENCE_TASK_NAME, [
          {
            latitude: geofenceRegion.latitude,
            longitude: geofenceRegion.longitude,
            radius: geofenceRegion.radius,
            notifyOnEnter: true,
            notifyOnExit: true,
          },
        ]);
        console.log("Geofencing started successfully.");
      } catch (error) {
        console.error("Error starting geofencing:", error);
        setErrorMsg(`Error starting geofencing: ${error.message || "Unknown error"}`);
      }
    };

    setupGeofence();

    // Cleanup on component unmount
    return () => {
      console.log("Stopping geofencing...");
      Location.stopGeofencingAsync(GEO_FENCE_TASK_NAME).catch((error) =>
        console.error("Error stopping geofencing:", error)
      );
    };
  }, []);

  useEffect(() => {
    TaskManager.defineTask(GEO_FENCE_TASK_NAME, ({ data, error }) => {
      if (error) {
        console.error("Error with geofencing event:", error);
        setErrorMsg(`Geofencing task error: ${error.message}`);
        return;
      }

      if (data) {
        const { eventType, region }: { eventType: string; region: Location.GeofencingRegion } = data;
        console.log("Geofence event triggered:");
        console.log("- Event type:", eventType);
        console.log("- Region:", region);

        setGeofenceStatus(eventType);
      } else {
        console.warn("Received geofencing task data but it is undefined or null.");
      }
    });

    // Cleanup task manager on component unmount
    return () => {
      console.log("Unregistering geofencing task...");
      TaskManager.unregisterTaskAsync(GEO_FENCE_TASK_NAME).catch((error) =>
        console.error("Error unregistering geofencing task:", error)
      );
    };
  }, []);

  return { geofenceStatus, errorMsg };
};

export default useGeofencing;

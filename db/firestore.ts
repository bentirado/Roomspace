// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, onAuthStateChanged, getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword, sendPasswordResetEmail } from 'firebase/auth';   
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";
import { router } from "expo-router";
import { firebaseConfig } from "../firebaseConfig";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);


// Initialize Firebase authentication service
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

//Function to sign in the user.
export const signIn = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      console.log("User signed in:", user);

      //Fetch user data
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        
        //Returning userData for updating information.
        const userData = fetchUserData(user.uid);
        return userData;
      } else {
        throw new Error("User document not found in Firestore.");
      }
    } catch (error) {
      console.log("Error during login:", error.message);
      Alert.alert(
        "Login Failed",
        "Your email or password is incorrect. \n Please try again.",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  }

export const signOutUser = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully.');
    } catch (error) {
      console.error('Error signing out: ', error);
      Alert.alert(
        "Error signing out.",
        "Please try again.",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  }

export const signUp = async (data: { name: string; email: string; password: string }) => {
  try {
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const uid = userCredential.user.uid;

    // Step 2: Store additional attributes in Firestore
    const userDoc = doc(db, 'users', uid);
    await setDoc(userDoc, {
      name: data.name,
      status: 'Home',
      roomId: '',
      email: data.email
    });
    console.log('Sign up successful!');
  } catch (error: any) {
    let alertMessage = 'An unexpected error occurred. Please try again.';

    // Firebase authentication errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        alertMessage = 'The email address is already in use by another account.';
        break;
      case 'auth/invalid-email':
        alertMessage = 'The email address is not valid. Please enter a valid email.';
        break;
      case 'auth/weak-password':
        alertMessage = 'The password is too weak. Please use a stronger password.';
        break;
      default:
        alertMessage = `Error: ${error.message}`;
        break;
    }

    // Display the alert
    Alert.alert(
      "Error",
      alertMessage,
      [{ text: "OK", onPress: () => {} }]
    );
  }
};
 
//This function is used to grab the current user in the GlobalProvider file.
export const handleAuthStateChange = (setUser, setIsLoggedIn, setIsLoading) => {
  setIsLoading(true); // Start loading state when the auth check begins

  const unsubscribe = onAuthStateChanged(getAuth(), async (authUser) => {
    try {
      if (authUser) {
        // User is logged in
        setIsLoggedIn(true);
        // Fetch user details from Firestore
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Merge Firebase Auth user data with Firestore user data
          setUser({
            ...authUser,
            ...userDoc.data(),
          });
        } else {
          console.warn('No user document found in Firestore for this UID.');
          setUser(authUser); // Fallback to Firebase Auth data
        }
      } else {
        // User is logged out
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      setUser(null); // Fallback to null on error
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false); // Set loading to false when the check is complete
    }
  });

  return unsubscribe; // Return unsubscribe function to clean up
};
  

//Function fetches the room data for use in the profile page.
//This implementation is really messy. Will probably refactor later into an object with parameters.
export const fetchRoomData = async (user, setRoomName, setMembers, setRoomCreator, setRoomCode, setRoomDesc) => {
  if (!user) return; // Return if no roomId is provided

  const userData = await fetchUserData(user.uid);

  const roomRef = doc(db, 'rooms', userData.roomId); // Reference to the room document

  const unsubscribeRoom = onSnapshot(roomRef, async (roomSnap) => {
    try {
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        setRoomName(roomData.name);
        setRoomCreator(roomData.creatorId);
        setRoomCode(roomData.roomCode);
        setRoomDesc(roomData.desc);
        const memberIds = roomData.members; // List of user IDs in the room

        // Set up a real-time listener for user data
        const usersRef = collection(db, 'users');
        const unsubscribeUsers = onSnapshot(usersRef, (userSnapshots) => {
          try {
            const userData = [];
            userSnapshots.forEach((userDoc) => {
              const data = userDoc.data();
              if (memberIds.includes(userDoc.id)) {
                userData.push({
                  id: userDoc.id,
                  name: data.name,
                  status: data.status,
                });
              }
            })

            setMembers(userData); // Update the members state whenever users data changes
          } catch (userError) {
            console.error('Error processing user data:', userError);
          }
        });

        // Clean up the listener when the component unmounts or room data changes
        return () => {
          unsubscribeUsers();
        };
      } else {
        console.log('No such room!');
      }
    } catch (roomError) {
      console.error('Error fetching room data:', roomError);
    }
  });

  // Clean up the room listener when the component unmounts or room data changes
  return () => unsubscribeRoom();
};

//This is used inside of some functions to fetch the user data for a return to the client. It is used to fix the bug of things not loading.
export const fetchUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  
  return userData
}

export const joinRoom = async (data, user) => {
  try {
    // Query the rooms collection to find a room with the given code
    const roomsQuery = query(collection(db, 'rooms'), 
    where('roomCode', '==', data.roomCode),
    where('name', '==', data.roomName)
    );
    const querySnapshot = await getDocs(roomsQuery);

    // Check if any room matches the code
    if (querySnapshot.empty) {
      throw new Error('Room with the specified code does not exist.');
    }

    // Assume the first room found is the correct one (room codes should be unique)
    const roomDoc = querySnapshot.docs[0];
    const roomId = roomDoc.id; // The room's ID
    const roomData = roomDoc.data();

    // Reference to the user document
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    // Update the user's roomId field
    await updateDoc(userDocRef, { roomId });

    // Add the user to the room's members array
    await updateDoc(doc(db, 'rooms', roomId), {
      members: arrayUnion(user.uid),
    });
    
    //Reload the user data for return;
    const userData = await fetchUserData(user.uid);

    return userData;
  } catch (error) {
    console.log("Error joining room:", error.message);
    Alert.alert(
      "Error joining room.",
      "The room name or code was incorrect. \n Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );
  }
}

export const leaveRoom = async (user, roomId) => {
  try {
    // Check if the user is in a room
    if (!user || !roomId) {
      throw new Error('User or Room ID is missing');
    }

    // Reference to the room document
    const roomDocRef = doc(db, 'rooms', roomId);

    // Fetch the room data to check for the current admin and members
    const roomDocSnap = await getDoc(roomDocRef);
    if (!roomDocSnap.exists()) {
      throw new Error('Room does not exist');
    }

    const roomData = roomDocSnap.data();
    const currentAdminId = roomData.creatorId; // Assuming the admin is stored in `creatorId`
    const members = roomData.members || [];

    // If the user is the current admin, promote a new admin
    if (user.uid === currentAdminId) {
      // Get the next user to promote (for simplicity, we’ll choose the first member that's not the current admin)
      const newAdmin = members.find(memberId => memberId !== currentAdminId);

      if (newAdmin) {
        // Update the room creator to the new admin
        await updateDoc(roomDocRef, { creatorId: newAdmin });
        console.log(`User ${newAdmin} is now the admin of the room: ${roomId}`);
      } else {
        console.log('No other members to promote to admin');
      }
    }

    // Reference to the user document
    const userDocRef = doc(db, 'users', user.uid);

    // Update the user's roomId field to remove them from the room
    await updateDoc(userDocRef, { roomId: '' });

    // Remove the user from the room's members array
    await updateDoc(roomDocRef, {
      members: arrayRemove(user.uid),
    });

    console.log(`User ${user.uid} has successfully left the room: ${roomId}`);

    // Check if the room is empty after the user leaves
    if (members.length === 1) { // If there is only 1 member left (the user leaving)
      // Delete the room
      await deleteDoc(roomDocRef);
      console.log(`Room ${roomId} has been deleted as it had no remaining members.`);
      return `Room ${roomId} has been deleted.`;
    }

    return `Successfully left the room: ${roomId}`;
  } catch (error) {
    console.error('Error leaving room:', error.message);
    Alert.alert(
      "Error leaving room.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );    
  }
};


// Function to create a new room
export const createRoom = async (roomName, roomCode, user) => {
  try {
    // Create a reference to the rooms collection
    const roomsRef = collection(db, 'rooms');

    // Check if a room with the same roomCode already exists
    const roomQuery = query(roomsRef, where('roomCode', '==', roomCode));
    const querySnapshot = await getDocs(roomQuery);

    if (!querySnapshot.empty) {
      throw new Error('Room code already exists');
    }

    // Create a new room document with Firestore auto-generated ID
    const roomDocRef = await addDoc(roomsRef, {
      name: roomName,
      roomCode: roomCode,
      members: [user.uid], // Add the creator to the room members list
      creatorId: user.uid,
      desc: 'A space to stay connected, track statuses, and collaborate. Let’s keep it productive and fun for everyone!'
    });

    // Optionally: Update the user's roomId in the Firestore users collection
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      roomId: roomDocRef.id, // Set the user's roomId to the new room's auto-generated ID
    });

    console.log('Room created successfully:', roomDocRef.id);

    const userData = await fetchUserData(user.uid);
    return userData; 
  } catch (error) {
    console.log("Error creating room:", error.message);
    Alert.alert(
      "Error creating room.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );
  }
};

//Used in the profile to change the status of the current user.
export const setStatus = async (user, newStatus) => {
  try {
    // Reference to the user's document in the Firestore database
    const userRef = doc(db, 'users', user.uid); // Assuming user data is stored in a 'users' collection
    
    // Update the user's status
    await updateDoc(userRef, {
      status: newStatus, // Set the new status
    });

    console.log(`User status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating user status:', error);
    Alert.alert(
      "Error changing status.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );
  }
};

export const updateRoom = async (user, roomId, roomName, roomDesc) => {
  try {
    //Refernce to the room document in the database
    const roomRef = doc(db, 'rooms', roomId)
    const roomDoc = await getDoc(roomRef)
    const roomData = roomDoc.data()
    if(user.uid == roomData.creatorId) {
    
    await updateDoc(roomRef, {
      name: roomName,
      desc: roomDesc,
    });
    Alert.alert(
      "Success!",
      "Your changes have been saved successfully.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
    console.log("Room name and description updated correctly!")
    }
    else {
      Alert.alert("Permission Denied", "You do not have permission to make these changes.");    }
    }
  catch (error) {
    console.error('Error updating room data:', error);
    Alert.alert(
      "Error updating room.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );
  }
}

export const updateRoomCode = async (user, roomId, roomCode) => {
  try {
    //Refernce to the room document in the database
    const roomRef = doc(db, 'rooms', roomId)
    const roomDoc = await getDoc(roomRef)
    const roomData = roomDoc.data()
    if(user.uid == roomData.creatorId) {
    
    await updateDoc(roomRef, {
      roomCode: roomCode,
    });
    console.log("Room code updated correctly.")
    }
    else {
      Alert.alert("Permission Denied", "You do not have permission to make these changes.");    }
    }
  catch (error) {
    console.error('Error updating room code:', error);
    Alert.alert(
      "Error updating room code.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );
  }
}

export const removeUserFromRoom = async (user, userId, roomId) => {
  try {
    //Refernce to the room document in the database
    const roomRef = doc(db, 'rooms', roomId)
    const roomDoc = await getDoc(roomRef)
    const roomData = roomDoc.data()
    
    //Reference to the user document
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    const userData = userDoc.data()
    if(user.uid == roomData.creatorId && user.uid != userId) {
    // Update the members array by removing the userId
    await updateDoc(roomRef, {
      members: arrayRemove(userId),
    });
    await updateDoc(userRef, {
      roomId: "",
    })
    Alert.alert('Member Removed', `${userData.name} has been removed from the room.`);
    console.log("User removed sucessfully.")
    }
    else {
      Alert.alert("Permission Denied", "You do not have permission to make these changes.");    }
    }
  catch (error) {
    console.error('Error removing user:', error);
    Alert.alert(
      "Error removing user.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );
  }
}

export const userDelete = async (user, password) => {
  try {
    if (!user || !user.uid) {
      throw new Error("User info is missing");
    }

    const userAuth = getAuth();
    const currentUser = userAuth.currentUser;

    await reauthenticateUser(password);

    // 1. Remove the user from the room (if they belong to one)
    if (user.roomId) {
      const roomRef = doc(db, 'rooms', user.roomId);
      const roomDoc = await getDoc(roomRef);

      if (roomDoc.exists()) {
        const roomData = roomDoc.data();

        // Check if the user is the room creator
        if (roomData.creatorId === user.uid) {
          // If this is the last member of the room, we just delete the room
          const remainingMembers = roomData.members.filter(memberId => memberId !== user.uid);
          if (remainingMembers.length === 0) {
            // Delete the room if there are no remaining members
            await deleteDoc(roomRef);
            console.log("Room is empty, deleted.");
          } else {
            // Assign a new creator from the remaining members
            const newCreatorId = remainingMembers[0];
            // Update the room document with the new creator
            await updateDoc(roomRef, {
              creatorId: newCreatorId,
              members: arrayRemove(user.uid), // Remove user from members list
            });
            console.log("User was the creator, new creator assigned.");
          }
        } else {
          // Just remove the user from the room if they are not the creator
          await updateDoc(roomRef, {
            members: arrayRemove(user.uid),
          });
          console.log("User removed from room.");
        }
      } else {
        console.warn("Room not found.");
      }
    }

    // 2. Delete the user document from the Firestore 'users' collection
    const userRef = doc(db, 'users', user.uid);
    await deleteDoc(userRef);
    console.log("User document deleted from Firestore.");

    // 3. Delete the user from Firebase Authentication
    if (currentUser && currentUser.uid === user.uid) {
      await deleteUser(currentUser);
      console.log("User deleted from Firebase Authentication.");
    } else {
      throw new Error("Authentication error: Unable to delete user.");
    }

    // Navigate back to the home page
    router.replace('/');
    console.log("User account deleted successfully.");
  }
  catch (error) {
    console.error("Error deleting user account:", error.message);
    Alert.alert(
      "Error deleting user account.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );  }
};

export const deleteRoom = async (user, roomId) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);
    const roomData = roomDoc.data();


    if(user.uid == roomData.creatorId) {
    if (!roomId) {
      throw new Error("Room ID is missing.");
    }

    if (!roomDoc.exists()) {
      throw new Error("Room not found.");
    }

    const members = roomData.members || [];

    // Clear the roomId attribute for all members
    const memberUpdates = members.map(async (memberId) => {
      const userRef = doc(db, 'users', memberId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await updateDoc(userRef, { roomId: '' });
        console.log(`Cleared roomId for user: ${memberId}`);
      } else {
        console.warn(`User document not found for member: ${memberId}`);
      }
    });

    // Wait for all member updates to complete
    await Promise.all(memberUpdates);

    // Delete the room document
    await deleteDoc(roomRef);
    console.log(`Room with ID ${roomId} deleted successfully.`);
    router.replace('/landing')

  }
  else {
    Alert.alert("Permission Denied", "You do not have permission to make these changes.");    
  }
  } catch (error) {
    console.error("Error deleting room:", error.message);
    Alert.alert(
      "Error deleting room.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );  }
  
};

export const updateUser = async (user, newName) => {
  try {
    //Refernce to the room document in the database
    const userRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userRef)
  
    await updateDoc(userRef, {
      name: newName,
    });
    Alert.alert(
      "Success!",
      "Your changes have been saved successfully.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
    console.log("User name updated correctly!")
  }
  catch (error) {
    console.error('Error updating user data:', error);
    Alert.alert(
      "Error updating user data.",
      "Please try again.",
      [{ text: "OK", onPress: () => {} }]
    );
  }
}


export const reauthenticateUser = async (password) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error("No user is currently logged in.");
    return;
  }

  try {
    // Prompt the user for their password
    const userPassword = password;

    if (!userPassword) {
      console.warn("Password input was canceled by the user.");
      return;
    }

    // Create email/password credentials
    const credential = EmailAuthProvider.credential(currentUser.email, userPassword);

    // Re-authenticate the user
    await reauthenticateWithCredential(currentUser, credential);
    console.log("User successfully re-authenticated.");

  }
  catch (error) {
    throw new Error("Error during re-authentication or user deletion:", error.message);
  }
};

export const changePassword = async (oldPassword, newPassword) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    //Reauthenicate the user
    await reauthenticateUser(oldPassword);

    //After authenticating, update the password
    await updatePassword(currentUser, newPassword);
    console.log("Password updated successfully");
    Alert.alert(
      "Success!",
      "Your changes have been saved successfully.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );  } 
    catch (error) {
    console.error("Error changing password: ", error);
    alert("Failed to change password. Please try again.");
  }
}

// Function to generate a new room code in the format "XXXX-1234"
export const generateRoomCode = async () => {
  const prefixes = [
    "ROOM", "GAME", "CHAT", "MEET", "TEST", 
    "LIVE", "CODE", "TEAM", "PLAY", "JOIN",
    "SAFE", "ZONE", "HOST", "PEER", "SYNC",
    "MOVE", "LINK", "WORK", "PAIR", "HOME",
  ];

  const numbers = "0123456789";

  // Function to generate 4 random digits
  const generateRandomNumbers = () =>
    Array.from({ length: 4 }, () =>
      numbers.charAt(Math.floor(Math.random() * numbers.length))
    ).join("");

  // Function to create a room code
  const generateRandomCode = () => {
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNumbers = generateRandomNumbers();
    return `${randomPrefix}-${randomNumbers}`;
  };

  // Check Firestore for existing room code
  const isCodeUnique = async (code) => {
    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("roomCode", "==", code));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Returns true if no match is found
  };

  // Generate a unique code
  let newRoomCode = generateRandomCode();
  while (!(await isCodeUnique(newRoomCode))) {
    newRoomCode = generateRandomCode(); // Regenerate if code is not unique
  }

  return newRoomCode;
};

export const sendPasswordReset = async (email) => {
  try {
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    alert('Password reset email sent to:', email);
  }
  catch (error) {
    console.error("Error sending password reset: ", error);
    alert("Failed to send password reset. Please try again.");
  }
}
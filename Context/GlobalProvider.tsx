import { createContext, useContext, useState, useEffect } from 'react';
import { handleAuthStateChange } from '../db/firestore'; // Assuming this is your Firebase auth logic
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../db/firestore'; // Assuming this is your Firebase configuration

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Holds additional user details from Firestore
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user data from Firestore
  const fetchUser = async (uid) => {
    if (!uid) return null;
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? { uid, ...userDoc.data() } : null;
  };

  // Function to reload user data
  const reloadUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userData = await fetchUser(currentUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error reloading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = handleAuthStateChange(
      setUser,
      setIsLoggedIn,
      setIsLoading
    );

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isLoading,
        reloadUser, // Expose reloadUser to the context consumers
        setIsLoading
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

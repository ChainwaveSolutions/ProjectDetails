import React, { useState, useEffect } from 'react';
import { Button, Box, Heading, Flex, Text } from '@chakra-ui/react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';  // Ensure correct import

const LoginPage = () => {
  const [user, setUser] = useState<any>(null); // State to store user info

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {  // Explicitly declare 'error' as 'any'
      if (error?.code === 'auth/popup-closed-by-user') {
        console.log('The popup was closed by the user before completing sign-in.');
      } else {
        console.error('Error logging in with Google:', error);
      }
    }
  };



  // Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Store the user information
      } else {
        setUser(null); // User is signed out
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <Box textAlign="center" mt={8}>
      {user ? (
        <>
          <Heading as="h1" mb={6}>Hello, {user.displayName}</Heading> {/* Display user's name */}
          <Text mb={6}>You are logged in.</Text>
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Heading as="h1" mb={6}>Login with Social Accounts</Heading>
          <Flex justifyContent="center" gap={4}>
            <Button colorScheme="blue" onClick={handleGoogleLogin}>
              Login with Google
            </Button>
            {/* Add more social login buttons here */}
          </Flex>
        </>
      )}
    </Box>
  );
};

export default LoginPage;

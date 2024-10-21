import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, Button, Link, Image } from '@chakra-ui/react';
import { GoogleAuthProvider, getAdditionalUserInfo, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(result);

      if (additionalUserInfo?.isNewUser) {
        navigate('/create-account');
      } else {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
    <Box bg="#440055" color="white" p={0}>
      <Flex justify="space-between" align="center" >
        <Link href="/">
          <Image p={0} ml="4" src="/images/textlogo.png" alt="Logo" width="220px" />
        </Link>
        <Flex align="center" mr="4">
          {user ? (
            <>
              <Text mr="4">Hi, {user.displayName.split(' ')[0]}</Text>
              <Button colorScheme="red" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              bgGradient="linear(to-b, #AA00D4, #8800AA)"
              boxShadow="0px 4px 12px rgba(0, 0, 0, 0.5)"
              onClick={handleGoogleLogin}
              color="white"

              size="sm"
              _hover={{
                transform: 'scale(1.05)', // Grows the button slightly on hover
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.7)', // Adds a shadow on hover
              }}
              transition="transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out" // Smooth transition
            >

              Login
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
    <Box mb="4px" bg="#ffffff" color="white" p={0}>

  </Box>
  </>

  );
};

export default Header;

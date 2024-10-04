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
    <Box bg="rgba(0, 0, 0, 0)" color="white" p={0}>
      <Flex justify="space-between" align="center" backgroundImage="url('/images/header-background.jpg')">
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
            <Button colorScheme="blue" onClick={handleGoogleLogin}>
              Login
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;

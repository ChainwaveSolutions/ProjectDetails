import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Button,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
} from '@chakra-ui/react';

import Footer from './Components/Footer/Footer';
import RegisterInterestForm from './Components/RegisterInterestForm';
import { motion } from 'framer-motion';
import { GoogleAuthProvider, getAdditionalUserInfo, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Make sure the path to your firebaseConfig is correct
import { useNavigate } from 'react-router-dom'; // Importing React Router for navigation

const phrases = ["BUSINESS", "FINANCIAL", "CONSUMERS", "EVERYONE"];

const RotatingText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <Text as="span" color="blue.300">{phrases[index]}</Text>
    </motion.div>
  );
};

const LandingPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<any>(null); // State to store user information
  const navigate = useNavigate(); // For navigation

  // Google Login
  const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const additionalUserInfo = getAdditionalUserInfo(result); // Correctly get additionalUserInfo

    if (additionalUserInfo?.isNewUser) {
      // Redirect new users to "Create Account" page
      navigate('/create-account');
    } else {
      // Set existing user info in the state
      setUser(result.user);
    }
  } catch (error) {
    console.error('Error logging in with Google:', error);
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

  const buttonGlow = {
    boxShadow: '0 0 15px rgba(128, 0, 255, 0.5)',
    _hover: {
      boxShadow: '0 0 20px rgba(128, 0, 255, 0.8)',
    },
  };

  return (
    <>
      {/* Navbar */}
      <Box flex={1} p={0} m={0} bg="rgba(0, 0, 0, 0)" display="flex" flexDirection="column" color="white">
        <Flex
          p={1}
          backgroundImage="url('/images/header-background.jpg')"
          justify="space-between"
          align="center"
        >
          <Link href="/">
            <Image p={0} ml="4" src="/images/textlogo.png" alt="Heading" width="220px" />
          </Link>

          {/* Login / User Info */}
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

      {/* Header Section */}
      <Box
        id="header"
        bg="gray.800"
        color="white"
        py={20}
        backgroundImage="url('/images/header-background.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
      >
        <Flex
          justifyContent="center"
          alignItems="center"
          flexDirection={{ base: 'column', md: 'row' }}
          maxW="1200px"
          mx="auto"
        >
          <Box p={8} flex="1">
            <Heading as="h1" size="2xl" mb={6}>
              PAYMENT SOLUTIONS FOR <br />
              <RotatingText />
            </Heading>
            <Text fontSize="xl" mb={8}>
              ChainWave Solutions offers a seamless, secure, and cost-effective way to engage with digital currencies.
            </Text>
            <Flex gap={4}>
              <Button
                colorScheme="blue"
                w="170px"
                size="lg"
                onClick={onOpen} // Trigger modal to open the form
                sx={buttonGlow}
              >
                Register Interest
              </Button>
              <Link href="#details">
                <Button
                  colorScheme="blue"
                  w="170px"
                  size="lg"
                  sx={buttonGlow}
                >
                  Learn More
                </Button>
              </Link>
            </Flex>
          </Box>
          <Box flex="1" display="flex" justifyContent="center">
            <Image
              src="/images/header-iphone.png"
              alt="Header Image"
              boxSize="400px"
            />
          </Box>
        </Flex>
      </Box>

      {/* Modal for Register Interest Form */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register Your Interest</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RegisterInterestForm />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Footer */}
      <Footer />

      {/* Other Sections ... */}
    </>
  );
};

export default LandingPage;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Button,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
} from '@chakra-ui/react';

import Footer from './Components/Footer/Footer';
import { motion } from 'framer-motion';
import { FaTwitter, FaGooglePlusG, FaLinkedinIn } from 'react-icons/fa';

const phrases = ["BUSINESS", "FINANCIAL", "CONSUMERS", "EVERYONE"];

const RotatingText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 2000); // Change every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={index} // Helps trigger the animation on every index change
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
  const buttonGlow = {
    boxShadow: '0 0 15px rgba(128, 0, 255, 0.5)', // Purple glow effect
    _hover: {
      boxShadow: '0 0 20px rgba(128, 0, 255, 0.8)', // Stronger glow on hover
    },
  };

  return (
    <>
      {/* Navbar */}
      <Box
        flex={1}
        p={0}
        m={0}
        bg="rgba(0, 0, 0, 0)"


        display="flex"
        flexDirection="column"
        color="white"
      >
        <Flex p={1}
        backgroundImage="url('/images/header-background.jpg')" justify="space-between" align="center">
          <Link href="/">
            <Image p={0} ml="4" src="/images/textlogo.png" alt="Heading" width="220px" />
          </Link>
          <Flex align="right">
            <w3m-button />
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
        <RotatingText /> {/* Rotating Text */}
      </Heading>
      <Text fontSize="xl" mb={8}>
        ChainWave Solutions offers a seamless, secure, and cost-effective way to engage with digital currencies.
      </Text>
      <Flex gap={4}>
        <Button
          colorScheme="blue"
          w="170px"
          size="lg"
          as="a"
          href="#contact"
          sx={buttonGlow}
        >
          Register Interest
        </Button>
        <Button
          colorScheme="blue"
          w="170px"
          size="lg"
          as="a"
          href="#details"
          sx={buttonGlow}
        >
          Learn More
        </Button>
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


      {/* Tabs for Features and Vision */}
      <Box bg="gray.100" py={16}>
        <Tabs variant="soft-rounded" colorScheme="blue" isFitted maxW="1200px" mx="auto">
          <TabList mb="1em">
            <Tab fontWeight="bold">Features</Tab>
            <Tab fontWeight="bold">Vision</Tab>
            <Tab fontWeight="bold">Details</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Heading as="h2" textAlign="center" mb={8}>Why Choose ChainWave Solutions?</Heading>
              <Text textAlign="center" fontSize="lg" mb={12}>
                ChainWave stands at the forefront of the digital currency revolution.
              </Text>
              <Flex direction={{ base: 'column', md: 'row' }} justifyContent="space-around">
                <Box p={4} textAlign="center" maxW="300px">
                  <Box mb={4}>
                    <Image src="/images/features-iphone-2.png" alt="Security" />
                  </Box>
                </Box>
                <Box p={4} textAlign="center" maxW="300px">
                  <Box mb={4}>
                  </Box>
                  <Heading as="h4" size="md" mb={2}>Security</Heading>
                  <Text>Robust encryption ensuring peace of mind for businesses and consumers.</Text>
                </Box>
                <Box p={4} textAlign="center" maxW="300px">
                  <Box mb={4}>
                  </Box>
                  <Heading as="h4" size="md" mb={2}>Affordability</Heading>
                  <Text>Competitive transaction fees make crypto payments viable for all businesses.</Text>
                </Box>
                <Box p={4} textAlign="center" maxW="300px">
                  <Box mb={4}>
                  </Box>
                  <Heading as="h4" size="md" mb={2}>Speed</Heading>
                  <Text>Our technology ensures transactions are swift and seamless.</Text>
                </Box>
              </Flex>
            </TabPanel>

            <TabPanel>
              <Heading as="h2" textAlign="center" mb={8}>Our Vision</Heading>
              <Text textAlign="center" fontSize="lg" mb={12}>
                At ChainWave Solutions, we believe in the transformative power of cryptocurrency.
              </Text>
              <Flex direction={{ base: 'column', md: 'row' }} justifyContent="space-around">
                <Box p={4} textAlign="center" maxW="400px">
                  <Heading as="h4" size="md" mb={2}>Driving Adoption</Heading>
                  <Text>We aim to form partnerships with leading brands to drive widespread cryptocurrency adoption.</Text>
                </Box>
                <Box p={4} textAlign="center" maxW="400px">
                  <Heading as="h4" size="md" mb={2}>Creating Ecosystems</Heading>
                  <Text>Building an ecosystem where cryptocurrency is not just an alternative but the preferred payment method.</Text>
                </Box>
              </Flex>
            </TabPanel>

            <TabPanel>
              <Heading as="h2" textAlign="center" mb={8}>Details</Heading>
              <Stack spacing={8} textAlign="center" maxW="800px" margin="0 auto">
                <Box>
                  <Heading as="h4" size="lg" mb={4}>Onramping - Fiat to Cryptocurrencies</Heading>
                  <Text>We enable users to convert fiat currencies into stablecoins efficiently.</Text>
                </Box>
                <Box>
                  <Heading as="h4" size="lg" mb={4}>Bridging Between Networks</Heading>
                  <Text>We offer robust cross-chain interoperability for seamless transfers across blockchain networks.</Text>
                </Box>
                <Box>
                  <Heading as="h4" size="lg" mb={4}>Off-Ramping for Businesses</Heading>
                  <Text>Businesses can convert their cryptocurrency holdings back into fiat currency easily.</Text>
                </Box>
                <Box>
                  <Heading as="h4" size="lg" mb={4}>KYC Verification</Heading>
                  <Text>Our KYC services ensure regulatory compliance and secure customer identification.</Text>
                </Box>
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Register Section */}
      <Box id="contact" bg="gray.800" color="white" py={16} textAlign="center" mx="auto">
        <Heading as="h2" mb={8}>Register Your Interest</Heading>
        <Text fontSize="lg" mb={6} p={4}>
          Register your interest or send us a message by completing the following form.
        </Text>
        <Flex justifyContent="center">
          <Button size="lg" colorScheme="blue" sx={buttonGlow}>
            Submit Interest
          </Button>
        </Flex>
      </Box>
      <Footer />
    </>
  );
};

export default LandingPage;

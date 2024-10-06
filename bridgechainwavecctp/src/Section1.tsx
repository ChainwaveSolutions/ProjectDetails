import React from 'react';
import { Box, Flex, Heading, Text, Image, Button } from '@chakra-ui/react';

const CryptopPage: React.FC = () => {
  return (
    <Box>
      {/* Header Section */}
      <Box as="header" bg="#151618" color="white" p={4}>
        <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
          <Heading as="h1" size="md">Cryptop</Heading>
          <Flex as="nav" align="center">
            <Button variant="link" color="white" mx={4}>Home</Button>
            <Button variant="link" color="white" mx={4}>About</Button>
            <Button variant="link" color="white" mx={4}>How</Button>
            <Button variant="link" color="white" mx={4}>
              <Image src="/images/wallet.png" alt="wallet" boxSize="20px" />
              Wallet
            </Button>
            <Button variant="link" color="white" mx={4}>Login</Button>
            <Button variant="link" color="white" mx={4}>Sign Up</Button>
          </Flex>
        </Flex>
      </Box>

      {/* Slider Section */}
      <Box bgImage="url('/images/hero-bg.jpg')" bgSize="cover" h="80vh">
        <Flex h="100%" align="center" justify="center">
          <Box textAlign="center" color="white">
            <Heading size="2xl">Digital Currency</Heading>
            <Heading size="lg">The Future of Trading</Heading>
            <Button mt={6} bg="#171717" color="white" _hover={{ bg: '#30ae69' }}>
              Get Started
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* How It Works Section */}
      <Box py={12} textAlign="center" maxW="1200px" mx="auto">
        <Heading as="h2" mb={6}>How It Works?</Heading>
        <Flex justify="center" flexWrap="wrap">
          <Box bg="#f6f5f7" p={6} m={4} maxW="325px" textAlign="center">
            <Box mb={4}>
              <Image src="/images/svg/trader.svg" alt="Traders" boxSize="75px" />
            </Box>
            <Heading as="h5" size="sm" mb={4}>Traders and Investors</Heading>
            <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
          </Box>
          <Box bg="#f6f5f7" p={6} m={4} maxW="325px" textAlign="center">
            <Box mb={4}>
              <Image src="/images/svg/exchanges.svg" alt="Exchanges" boxSize="75px" />
            </Box>
            <Heading as="h5" size="sm" mb={4}>Exchanges</Heading>
            <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
          </Box>
          <Box bg="#f6f5f7" p={6} m={4} maxW="325px" textAlign="center">
            <Box mb={4}>
              <Image src="/images/svg/mining.svg" alt="Miners" boxSize="75px" />
            </Box>
            <Heading as="h5" size="sm" mb={4}>Miners</Heading>
            <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
          </Box>
        </Flex>
        <Button mt={6} bg="#171717" color="white" _hover={{ bg: '#30ae69' }}>
          Read More
        </Button>
      </Box>

      {/* About Section */}
      <Box py={12} textAlign="center" bg="#f6f5f7">
        <Heading as="h2" mb={6}>About Cryptop</Heading>
        <Flex justify="center" align="center" flexDirection="column">
          <Image src="/images/about-img.png" alt="About Cryptop" mb={6} />
          <Text maxW="800px" mb={6}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Text>
          <Button bg="#171717" color="white" _hover={{ bg: '#30ae69' }}>Read More</Button>
        </Flex>
      </Box>

      {/* App Section */}
      <Box py={12} textAlign="center" bgGradient="linear(to-r, #30ae69, #072e85)" color="white">
        <Heading as="h2" mb={6}>Our Powerful App to Connect It All</Heading>
        <Text mb={6}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
        </Text>
        <Flex justify="center" mb={6}>
          <Button as="a" href="#" mx={2}>
            <Image src="/images/app-store.png" alt="App Store" />
          </Button>
          <Button as="a" href="#" mx={2}>
            <Image src="/images/play-store.png" alt="Play Store" />
          </Button>
        </Flex>
        <Image src="/images/app-img.png" alt="App" mx="auto" />
      </Box>

      {/* Footer Section */}
      <Box as="footer" bg="#171717" color="white" py={4} textAlign="center">
        <Text>&copy; 2024 All Rights Reserved By Cryptop</Text>
      </Box>
    </Box>
  );
};

export default CryptopPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Link,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Footer from './Components/Footer/Footer';
import RegisterInterestForm from './Components/RegisterInterestForm';
import Table from './table';


import USDCBridgetests from './USDCBridgetests';
import Stripe from './LandingPage2';
import Header from './Components/Header'; // Dave heres the Import Header component

const phrases = ["BUSINESS", "FINANCIAL", "CONSUMERS", "EVERYONE"];

const RotatingText = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);



  // find text color gradient for this same as button  grsdient

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 1.5 }}
    >

      <Text as="span"  color="#4567c4">{phrases[index]}</Text>
    </motion.div>
  );
};

const LandingPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const buttonGlow = {
    boxShadow: '0 0 15px rgba(255, 0, 248, 0.5)',
    _hover: {
      boxShadow: '0 0 50px rgba(255, 0, 248, 0.8)',
    },
  };

  return (
    <>
      {/* Header imoprted now and seperated to ensure uniformity on page dave check components folder for the file */}
      <Header />

      <Box
        id="header"
        bg="gray.800"
        color="white"
        py={20}
        backgroundImage="url('/images/b1.gif')"
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
                bgGradient="linear(to-r, #b531d4, #4567c4)" color="white"
                w="170px"
                size="lg"
                onClick={onOpen}
                sx={buttonGlow}
              >
                Register Interest
              </Button>
              <Link href="#details">
                <Button bgGradient="linear(to-r, #4567c4, #b531d4)" color="white" w="170px" size="lg" sx={buttonGlow}>
                  Learn More
                </Button>
              </Link>
            </Flex>
          </Box>
          <Box flex="1" display="flex" justifyContent="center">
            <Image src="/images/header-iphone.png" alt="Header Image" boxSize="400px" />
          </Box>
        </Flex>
      </Box>


      {/* App Section */}
      <Box py={12} textAlign="center" bgGradient="linear(to-r, #19072b, #19072b)" color="white">
      <Image src="/images/textlogo.png" alt="App" w="170px" mx="auto" />
        <Heading fontSize="2xl" mb={6}>Login or Register here.</Heading>
        <Text maxW="600px" mx="auto" mb={6}>
        </Text>
        <Flex gap={5} p={4} justify="center" mb={6}>

          <Button bgGradient="linear(to-r, #b531d4, #4567c4)" color="white" w="170px" size="lg" sx={buttonGlow}>
            Login
          </Button>
          <Button bgGradient="linear(to-r, #b531d4, #4567c4)" color="white" w="170px" size="lg" sx={buttonGlow}>
              Register
            </Button>
        </Flex>
      </Box>


      {/* App Section */}
      <Box py={12} textAlign="center" bgGradient="linear(to-r, #19072b, #b531d4)" color="white">
        <Heading as="h2" mb={6}>About Chainwave</Heading>
        <Text p={4} maxW="600px" mx="auto" mb={6}>
Welcome to Chainwave Solutions! We're all about making payments faster and easier, whether you're using traditional currency or crypto. Our goal is to bring you the best of both worlds, with quick, secure, and seamless transactions that fit your needs. At Chainwave, we’re driven by innovation and a commitment to keep things simple, efficient, and always customer-focused.
        </Text>
        <Flex justify="center" mb={6}>
        </Flex>
        <Image src="/images/logoonly.png" alt="App" mx="auto" />
      </Box>

            {/* How It Works Section */}
            <Box py={12} bg="#19072b" textAlign="center"  mx="auto">
              <Heading color="#f6f5f7" as="h2" mb={6}>How It Works?</Heading>
              <Flex justify="center" flexWrap="wrap">
              <Box bg="#f6f5f7" p={6} m={4} maxW="325px" textAlign="center">
              <Box mb={4} display="flex" justifyContent="center">
                <Image src="/images/svg/trader.svg" alt="Exchanges" boxSize="75px" />
              </Box>
              <Heading as="h5" size="sm" mb={4}>Exchanges</Heading>
              <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
            </Box>

                <Box bg="#f6f5f7" p={6} m={4} maxW="325px" textAlign="center">
                <Box mb={4} display="flex" justifyContent="center">
                  <Image src="/images/svg/exchanges.svg" alt="Exchanges" boxSize="75px" />
                </Box>
                <Heading as="h5" size="sm" mb={4}>Exchanges</Heading>
                <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
              </Box>

              <Box bg="#f6f5f7" p={6} m={4} maxW="325px" textAlign="center">
              <Box mb={4} display="flex" justifyContent="center">
                <Image src="/images/svg/mining.svg" alt="Exchanges" boxSize="75px" />
              </Box>
              <Heading as="h5" size="sm" mb={4}>Exchanges</Heading>
              <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
            </Box>
              </Flex>
              <Button mt={6} bg="#171717" color="white" _hover={{ bg: '#b531d4' }}>
                Read More
              </Button>
            </Box>

            {/* App Section */}
              <Box py={12} textAlign="center"
                color="white"

                backgroundImage="url('/images/p9.gif')"
                backgroundSize="cover"
                backgroundPosition="center"
                backgroundRepeat="no-repeat"
                >
                <Heading p={4}  as="h2" mb={6}>Our Powerful App to Connect It All</Heading>
                <Text p={4}  maxW="600px" mx="auto" mb={6}>
          Chainwave Solutions offers an application that leverages advanced blockchain technology to streamline simple transactions. This application ensures that transactions are secure, transparent, and immutable, making them tamper-proof and permanently recorded.          </Text>
                <Flex gap={5} justify="center" mb={6}>


                </Flex>
                <Image src="/images/header-iphone.png" alt="" mx="auto" />
              </Box>

                    {/* table here  i imported */}
                    <Box py={12} textAlign="center" bgGradient="linear(to-r, #19072b, #19072b)" color="white">
                    <Image src="/images/textlogo.png" alt="App" w="170px" mx="auto" />
                      <Heading fontSize="2xl" mb={6}>Chainwave Features Comparison</Heading>
                      <Text maxW="1200px" mx="auto" mb={6}>
                      </Text>
                      <Flex  p={4} justify="center" mb={6}>
              <Table/>
                      </Flex>
                    </Box>


      {/* App Section2 */}
      <Box py={12} textAlign="center" bgGradient="linear(to-r, #19072b, #4567c4)" color="white">
        <Heading p={4}  as="h2" mb={6}>Chainwave Support When you Need it!</Heading>
        <Text p={4}  maxW="600px" mx="auto" mb={6}>
        At Chainwave Solutions, we are committed to streamlining fast and
        efficient transactions for our clients. Our dedicated team prioritizes
        security to ensure that all your transactional data is handled with the
        utmost care. We are here to assist you with any transactional data
        recovery needs and to answer any questions regarding KYC (Know
        Your Customer) and KYB (Know Your Business) setups.
                </Text>
        <Flex gap={5} justify="center" mb={6}>
            <Image src="/images/app-store.png" alt="App Store" />

            <Image src="/images/play-store.png" alt="Play Store" />
        </Flex>
        <Image src="/images/app-img.png" alt="Coming Soon to Digital Platforms" mx="auto" />
      </Box>



      <Box py={12} textAlign="center" bgGradient="linear(to-r, #19072b, #19072b)" color="white">
      <Box mx="auto" maxW="680px" >

<Stripe/>
      </Box>
    </Box>

         <Box py={12} textAlign="center" bgGradient="linear(to-r, #19072b, #19072b)" color="white">
          <Box mx="auto" maxW="680px" >

            <USDCBridgetests/>
          </Box>
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
      <Box py={12} textAlign="center" bgGradient="linear(to-r, #19072b, #1f3363)" color="white">
        <Heading as="h1" mb={6}>Chainwave Solutions</Heading>
        <Text fontSize="xl" mb={6}>"Empowering Financial Freedom with Every Transaction"</Text>
        <Text mb={6}>
        </Text>
        <Flex justify="center" mb={6}>
        </Flex>
        <Image p={6} src="/images/textlogo.png" alt="App" mx="auto" />
      </Box>
      <Footer />


    </>
  );
};

export default LandingPage;

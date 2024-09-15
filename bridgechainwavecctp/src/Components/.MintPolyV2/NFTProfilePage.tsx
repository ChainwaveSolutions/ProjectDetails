import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text, Button, useToast, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import Footer from '../Footer/Footer';
import MiniMintPoly from '../MintNowMiniPolyV2/MintNow2nopadding';
import MiniMintBsc from '../MintNowMini/MintNow2nopadding';
import registerAbi from './registerAbi.json';
import nftAbi from './nftMintAbi.json';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';

interface NftAttribute {
  trait_type: string;
  value: string;
}

interface NftData {
  name: string;
  description: string;
  attributes: NftAttribute[];
}

const NFTProfilePagepolyV2 = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [nftData, setNftData] = useState<NftData | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const registerContractAddress = '0x806d861aFE5d2E4B3f6Eb07A4626E4a7621B90b3';
  const nftContractAddress = '0x721761446D1595346475A9F0d7dc13a1B93Ffcc3';
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        const response = await fetch(`/137nftdataV2/Metadata/${tokenId}.json`);
        const data: NftData = await response.json();
        setNftData(data);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
      }
    };

    const checkRegistrationStatus = async () => {
      if (!walletProvider) return;
      try {
        const provider = new ethers.BrowserProvider(walletProvider);
        const registerContract = new ethers.Contract(registerContractAddress, registerAbi, provider);
        const registeredNFTs = await registerContract.getRegisteredNFTs();
        const isRegistered = registeredNFTs.some((nft: any) => nft.tokenId.toString() === tokenId);
        setIsRegistered(isRegistered);
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    };

    fetchNFTData();
    checkRegistrationStatus();
  }, [tokenId, walletProvider]);

  const registerNFT = async () => {
    if (!nftData || !walletProvider || !isConnected || !address) {
      console.log('nftData:', nftData);
      console.log('walletProvider:', walletProvider);
      console.log('isConnected:', isConnected);
      console.log('address:', address);
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to register the NFT.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const traitAttribute = nftData.attributes.find(attr => attr.trait_type === "Background");
    if (!traitAttribute || !traitAttribute.value) {
      console.error('Background trait not found:', traitAttribute);
      toast({
        title: 'Registration Error',
        description: 'Could not find the Background trait for this NFT.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const traitValue = traitAttribute.value;
    console.log(`Using Background trait value: ${traitValue}`);
    console.log('tokenId:', tokenId);

    let tokenIdNumber;
    try {
      tokenIdNumber = Number(tokenId);
      if (isNaN(tokenIdNumber) || tokenIdNumber < 0 || tokenIdNumber > 511) {
        throw new Error('Invalid tokenId range');
      }
      console.log('Validated tokenIdNumber:', tokenIdNumber);
    } catch (error) {
      console.error('Invalid tokenId:', error);
      toast({
        title: 'Invalid Token ID',
        description: 'The tokenId is not valid. It must be a number between 0 and 511.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      console.log('Signer address:', await signer.getAddress());

      const nftContract = new ethers.Contract(nftContractAddress, nftAbi, provider);
      const ownerAddress = await nftContract.ownerOf(tokenIdNumber);
      console.log('Owner address:', ownerAddress);

      if (ownerAddress.toLowerCase() !== address.toLowerCase()) {
        console.log('Owner mismatch:', ownerAddress, address);
        toast({
          title: 'Registration Failed',
          description: "You are not the owner of this NFT.",
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      console.log('Registering NFT with trait value:', traitValue);
      const registerContract = new ethers.Contract(registerContractAddress, registerAbi, signer);
      const tx = await registerContract.registerNFT(tokenIdNumber, traitValue);
      await tx.wait();

      toast({
        title: 'NFT Registered',
        description: 'Your NFT has been registered successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setIsRegistered(true);
    } catch (error) {
      console.error('Error registering NFT:', error);
      toast({
        title: 'Registration Error',
        description: 'An error occurred during registration. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  if (!nftData) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <Box
        position="relative"
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
        color="white"
      >
        <video
          autoPlay
          loop
          muted
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            objectFit: 'cover',
            zIndex: -2
          }}
        >
          <source src="/images/pigzbkg.mp4" type="video/mp4" />
        </video>

        <Box
          flex={1}
          p={0}
          m={0}
          bg="rgba(0, 0, 0, 0.65)"
          display="flex"
          flexDirection="column"
          color="white"
        >
          <Flex p={2} bg="rgba(0, 0, 0, 0.61)" justify="space-between" align="center">
            <Link to="/">
              <Image p={2} ml="4" src="/images/mainlogovert.png" alt="Heading" width="80px" />
            </Link>
            <Flex align="right">
              <w3m-button />
            </Flex>
          </Flex>
          <Flex
            flex={1}
            mt={2}
            p={4}
            borderRadius="2xl"
            textAlign="center"
            bg="rgba(0, 0, 0, 0.61)"
            alignItems="flex-start"
            justifyContent="center"
            h="auto" // Adjust height as necessary
          >
            <Box ml={4}>
              <Text textAlign="left" fontSize="xl" fontWeight="bolder">
                View User Stats and collection details here
              </Text>
              <Button
                as={RouterLink}
                to="/user"
                colorScheme="purple"
                size="md"
                mt={4}
                textAlign="left"
              >
                Go to User Page
              </Button>
            </Box>
          </Flex>
          <Box
            flex={1}
            p={0}
            m={0}
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="cover"
            color="white"
          >
            <Box
              flex={1}
              p={4}
              m={2}
              bg="rgba(0, 0, 0, 0.65)"
              borderRadius="2xl"
              boxShadow="md"
              textAlign="center"
            >
              <Image
                borderRadius="2xl"
                mx="auto"
                src={`/137nftdataV2/Images/${tokenId}.png`}
                alt={nftData.name}
                width="75%"
              />
            </Box>
            <Box
              flex={1}
              p={4}
              m={2}
              bg="rgba(0, 0, 0, 0.65)"
              borderRadius="2xl"
              boxShadow="md"
            >
              <Text fontSize="4xl" mb={4}>{nftData.name}</Text>
              <Text fontSize="md" mb={4}>{nftData.description}</Text>
              {nftData.attributes.map((attribute: NftAttribute, index: number) => (
                <Text key={index} fontSize="3xl" mb={2}>
                  {attribute.trait_type}: {attribute.value}
                </Text>
              ))}
              {isRegistered ? (
                <Text mt={4} color="green.500" fontSize="xl" fontWeight="bold">
                  Already Registered
                </Text>
              ) : (
                <Button
    mt={4}
    colorScheme="purple"
    isLoading={loading}
    onClick={registerNFT}
    width="full"
  >
    Register NFT
  </Button>

              )}
            </Box>
          </Box>
          <Flex bg="rgba(0, 0, 0, 0.65)" borderRadius="2xl" p={0} mb={0} h="490px" justifyContent="center" alignItems="center">
            <Box
              flex={1}
              p={4}
              m={2}
              borderRadius="2xl"
              boxShadow="md"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <MiniMintPoly />
              <MiniMintBsc />
            </Box>
          </Flex>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default NFTProfilePagepolyV2;

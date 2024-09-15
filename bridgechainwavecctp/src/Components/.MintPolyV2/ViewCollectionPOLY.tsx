import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast as notify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Button,
  Image,
  Text,
  Link,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Wrap,
  WrapItem,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons'; // Import Chakra UI icon

import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import nftMintAbi from './mintBscAbi.json';

// og test ca nft = 0xA4F64d98ad39A25975D19AC174F9E7a35209369A
const NFTMINT_CONTRACT_ADDRESS = '0x721761446D1595346475A9F0d7dc13a1B93Ffcc3';
const RPC_PROVIDER = 'https://polygon-rpc.com';
const EXPLORER_LINK = 'https://polygonscan.com';
const METADATA_BASE_URL = '/137nftdataV2/Metadata/';
const MAX_TOKEN_ID = 511;

const getExplorerLink = (tokenId: number) => `${EXPLORER_LINK}/token/${NFTMINT_CONTRACT_ADDRESS}?a=${tokenId}`;
const getMarketplaceLinkElement = (tokenId: number) => `https://opensea.io/assets/matic/${NFTMINT_CONTRACT_ADDRESS}/${tokenId}`;
const getMarketplaceLinkTofu = (tokenId: number) => `https://tofunft.com/nft/polygon/${NFTMINT_CONTRACT_ADDRESS}/${tokenId}`;

declare global {
  interface Window {
    ethereum?: Record<string, unknown>;
  }
}

const addNftToWallet = async (tokenId: number, imageUrl: string) => {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('Ethereum object not found');
    }

    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: {
          address: NFTMINT_CONTRACT_ADDRESS,
          tokenId: tokenId.toString(),
          symbol: 'PIGZ',
          image: imageUrl,
        },
      },
    });

    if (wasAdded) {
      notify.success('NFT added to wallet!');
    } else {
      notify.error('NFT addition rejected');
    }
  } catch (error) {
    console.error('Error adding NFT to wallet', error);
    notify.error('Error adding NFT to wallet');
  }
};

const fetchMetadata = async (tokenId: number) => {
  try {
    const response = await fetch(`${METADATA_BASE_URL}${tokenId}.json`);
    if (response.ok) {
      const metadata = await response.json();
      const imageUrl = `/137nftdataV2/Images/${tokenId}.png`;
      return imageUrl;
    } else {
      throw new Error('Failed to fetch metadata');
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return 'https://via.placeholder.com/150';
  }
};

interface Nft {
  tokenId: number;
  imageUrl: string;
}

function MyNfts() {
  const toast = useToast();
  const navigate = useNavigate();
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        try {
          const accounts: string[] = await provider.send("eth_requestAccounts", []);
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        } catch (error) {
          notify.error('Please connect to your Wallet.');
        }

        (window.ethereum as any).on('accountsChanged', async (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          } else {
            setAddress(null);
            setIsConnected(false);
          }
        });

        (window.ethereum as any).on('chainChanged', async (chainId: string) => {
          const network = await provider.getNetwork();
          const accounts = await provider.listAccounts();
          if (network.chainId && accounts.length > 0) {
            const accountAddresses = await Promise.all(accounts.map((account) => account.getAddress()));
            setAddress(accountAddresses[0]);
          }
        });
      } else {
        notify.error('Wallet not Detected. Try Refreshing or Install a Wallet to use this app.');
      }
    };

    initializeConnection();
  }, []);

  const fetchNFTs = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider(RPC_PROVIDER);
      const nftContract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, provider);
      const nftList: Nft[] = [];

      const tokenFetchPromises = [];
      for (let i = 0; i < MAX_TOKEN_ID; i++) {
        tokenFetchPromises.push(
          (async () => {
            try {
              const owner = await nftContract.ownerOf(i);
              if (owner.toLowerCase() === address?.toLowerCase()) {
                const imageUrl = await fetchMetadata(i);
                nftList.push({ tokenId: i, imageUrl });
              }
            } catch (err) {
              // Handle cases where the token does not exist or other errors
            }
          })()
        );
      }

      await Promise.all(tokenFetchPromises);

      setNfts(nftList);
      console.log('NFTs fetched:', nftList);
    } catch (error) {
      toast({
        title: 'Error Fetching NFTs',
        description: 'There was an issue fetching NFTs from the contract.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
    }
  }, [isConnected]);

  return (
    <>
      <Box
        position="relative"
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
      >
        <Box
          flex={1}
          p={0}
          m={0}
          display="flex"
          flexDirection="column"
          bg="rgba(0, 0, 0, 0.2)"
          bgPosition="center"
          bgRepeat="no-repeat"
          bgSize="cover"
        >
          <Grid templateColumns={{ base: '1fr', md: '1fr 2fr 1fr' }} width="100%" mx="auto" marginTop="10px">
            <GridItem></GridItem>
            <GridItem display="flex" justifyContent="center">
              <Image src="/images/piratepigztextlogosideV2.png" alt="header" mx="auto" width="45%" minW="100px" mt="18px" />
            </GridItem>
            <GridItem display="flex" justifyContent="center"></GridItem>
            <GridItem display={{ base: 'flex', md: 'block' }} justifyContent="center">
              {/* Placeholder for any additional elements */}
            </GridItem>
          </Grid>

          <Box
            bg="rgba(0,0,0,0.0)"
            borderRadius="2xl"
            maxW="100%"
          >
            Your Polygon Collection
          </Box>

          <Box
            bgPos="center"
            bgSize="cover"
            borderRadius="2xl"
            maxH="500px"
            width="600px"
          ></Box>

          <Box
            bg="rgba(0,0,0,0.0)"
            maxW="90%"
            mx="auto"
            my="20px"
          >
            <Box
              bg="rgba(0,0,0,0)"
              width="100%"
              mx="auto"
            ></Box>

            {loading ? (
              <Text
                className="totalSupply"
                style={{
                  marginBottom: '40px',
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                Please be patient while Loading...
              </Text>
            ) : nfts.length === 0 ? (
              <Text
                className="totalSupply"
                style={{
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                No NFTs found.
              </Text>
            ) : (
              <Wrap spacing="10px" justify="center">
                {nfts.map(({ tokenId, imageUrl }) => (
                  <WrapItem key={tokenId} flexBasis={{ base: '100%', sm: '48%', md: '31%', lg: '12%' }}>
                    <Box
                      bg="rgba(0, 0, 0, 0)"
                      p="4"
                      mt={2}
                      mb={2}
                      borderRadius="2xl"
                      position="relative"
                      overflow="hidden"
                      border="5px solid"
                      borderColor="#7140d7"
                      _hover={{
                        '.overlay': {
                          opacity: 1,
                        }
                      }}
                    >
                      <Image
                        mt={9}
                        mb={9}
                        src={imageUrl}
                        alt={`NFT ${tokenId}`}
                        width="100%"
                        height="100%"
                        borderRadius="2xl"
                        objectFit="cover"
                        mx="auto"
                        my="auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/250';
                        }}
                        onClick={() => {
                          setSelectedImage(imageUrl);
                          onOpen();
                        }}
                      />
                      <Box
                        className="overlay"
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        bg="rgba(0, 0, 0, 0.7)"
                        opacity="0"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        transition="opacity 0.3s ease-in-out"
                      >
                        <Text mt="2" color="white" textAlign="center">
                          Pirate Pigz TokenId {tokenId}
                        </Text>

                        <Link href={getMarketplaceLinkElement(tokenId)} isExternal>
                          <Button
                            mt="2"
                            width="160px"
                            bg="#7140d7"
                            textColor="white"
                            _hover={{ bg: '#c45b79' }}
                          >
                            Element Market
                          </Button>
                        </Link>
                        <Link href={getMarketplaceLinkTofu(tokenId)} isExternal>
                          <Button
                            mt="2"
                            width="160px"
                            bg="#7140d7"
                            textColor="white"
                            _hover={{ bg: '#c45b79' }}
                          >
                            Tofu NFT
                          </Button>
                        </Link>

                        <Button
                          mt="2"
                          width="160px"
                          bg="#7140d7"
                          textColor="white"
                          _hover={{ bg: '#c45b79' }}
                          onClick={() => {
                            setSelectedImage(imageUrl);
                            onOpen();
                          }}
                        >
                          Full Screen
                        </Button>
                        <Button
                          mt="2"
                          width="160px"
                          bg="#7140d7"
                          textColor="white"
                          _hover={{ bg: '#c45b79' }}
                          onClick={() => navigate(`/nftpolyv2/${tokenId}`)}
                        >
                          View Details
                        </Button>

                        <Link
                          style={{
                            marginTop: '40px',
                            color: 'white',
                            padding: '10px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                          }}
                          href={getExplorerLink(tokenId)}
                          isExternal
                          mt="2"
                          color="white"
                          textAlign="center"
                        >
                          View on PolygonScan
                        </Link>
                      </Box>
                    </Box>
                  </WrapItem>
                ))}
              </Wrap>
            )}
          </Box>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton color="white" />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="black"
          >
            {selectedImage && (
              <Image src={selectedImage} alt="NFT Fullscreen" maxH="90vh" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <ToastContainer />
    </>
  );
}

export default MyNfts;

import React, { useEffect, useState } from 'react';
import { Flex, Box, Image, Text, Link } from '@chakra-ui/react';
import { useWeb3Modal } from '@web3modal/ethers/react';
import { ethers } from 'ethers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter as faXTwitter, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faChartLine } from '@fortawesome/free-solid-svg-icons';

const Footer: React.FC = () => {
  const { open } = useWeb3Modal();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum as any);
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].toString());
            setProvider(web3Provider);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);


  return (
    <footer style={{ backgroundColor: 'rgba(0, 0, 0, 1)', color: 'white', textAlign: 'center' }}>
      <Box
      >  <Box
          bg="rgba(0, 0, 0, 0.95)"
          p={6}
        >
      </Box>


        <Flex p={2} bg="rgba(0, 0, 0, 0.61)" mt="15px" justify="center" align="center" gap={1}>


        </Flex>
                <Flex p={0} bg="rgba(0, 0, 0, 0.61)" mt="1px" justify="center" align="center" gap={1}>

                  <Image p={2} ml="4" src="/images/textonly.png" alt="Heading" width="170px" />

                </Flex>


        <Flex mt="15px" mb="15px" justify="center" align="center" gap={4}>
          <Link href="" isExternal>
            <FontAwesomeIcon icon={faGlobe} size="xl" />
          </Link>
          <Link href="" isExternal>
            <FontAwesomeIcon icon={faXTwitter} size="xl" />
          </Link>
          <Link href="" isExternal>
            <FontAwesomeIcon icon={faTelegram} size="xl" />
          </Link>

        </Flex>




        <Text mt="25px" fontSize="sm" mb={2}>Currently Connected to</Text>
        <Flex mb={2} justifyContent="center" flexWrap="wrap">
          <w3m-network-button />
        </Flex>
        <Flex mb={4} justifyContent="center" flexWrap="wrap">
          <w3m-button />
        </Flex>

                <Text fontSize="xl" mt={2}>&copy;  Chainwave Solutions Incorporated {currentYear} </Text>




        <Flex mt="800px" justifyContent="center" flexWrap="wrap">
        </Flex>


      </Box>
    </footer>
  );
};

export default Footer;

// <Link href="https://faucets.chain.link/" isExternal>
//   <Text color="blue.500"mt="25px" fontSize="sm" mb={2}>Testnet Tokens Faucet Link</Text>
// </Link>
//
// <Link href="https://faucet.circle.com/" isExternal>
//   <Text color="blue.500" mt="25px" fontSize="sm" mb={2}>USDC Faucet Link</Text>
// </Link>

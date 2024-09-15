import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, Switch, useToast, useClipboard, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import registerAbi from './registerAbi.json';
import axios from 'axios';

const AdminPage = () => {
  const [claimingEnabled, setClaimingEnabled] = useState(false);
  const [totalClaimValue, setTotalClaimValue] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const [tokenPriceUSD, setTokenPriceUSD] = useState(0);
  const [claimsData, setClaimsData] = useState<{ address: string; claimCount: number; collectedCount: number }[]>([]);
  const toast = useToast();
  const { walletProvider } = useWeb3ModalProvider();

  // Register contract address
  const registerContractAddress = '0x806d861aFE5d2E4B3f6Eb07A4626E4a7621B90b3';
  const { hasCopied, onCopy } = useClipboard(registerContractAddress);

  useEffect(() => {
    if (walletProvider) {
      const fetchData = async () => {
        const provider = new ethers.BrowserProvider(walletProvider);
        const registerContract = new ethers.Contract(registerContractAddress, registerAbi, provider);

        try {
          const enabled = await registerContract.claimingEnabled();
          setClaimingEnabled(enabled);

          // Fetch claims data
          const [addresses, claimCounts, totalClaims] = await registerContract.getClaimsData();
          const claimsData = await Promise.all(addresses.map(async (address: string, index: number) => {
            const collectedCount = await registerContract.userClaimCounts(address);
            return {
              address,
              claimCount: Number(claimCounts[index]),
              collectedCount: Number(collectedCount)
            };
          }));
          setClaimsData(claimsData);

          // Calculate total claim value as the sum of all valid claims multiplied by the reward per claim
          const totalClaimCount = claimsData.reduce((sum: number, { claimCount }: { claimCount: number }) => sum + claimCount, 0);
          const calculatedTotalClaimValue = totalClaimCount * 20; // 20 MATIC per valid claim
          setTotalClaimValue(calculatedTotalClaimValue);

          const balance = await provider.getBalance(registerContractAddress);
          setContractBalance(Number(ethers.formatEther(balance)));

          // Fetch token price in USD
          const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
              ids: 'polygon',
              vs_currencies: 'usd',
            },
          });
          setTokenPriceUSD(data.polygon.usd);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [walletProvider]);

  const toggleClaiming = async () => {
    if (!walletProvider) return;

    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const registerContract = new ethers.Contract(registerContractAddress, registerAbi, signer);

      const tx = await registerContract.setClaimingEnabled(!claimingEnabled);
      await tx.wait();

      setClaimingEnabled(!claimingEnabled);
      toast({
        title: `Claims ${!claimingEnabled ? 'enabled' : 'disabled'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error toggling claiming:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle claim status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const recoverFunds = async () => {
    if (!walletProvider) return;

    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const registerContract = new ethers.Contract(registerContractAddress, registerAbi, signer);

      const tx = await registerContract.recoverFunds();
      await tx.wait();

      toast({
        title: 'Funds Recovered',
        description: 'Unclaimed funds have been successfully recovered.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      const balance = await provider.getBalance(registerContractAddress);
      setContractBalance(Number(ethers.formatEther(balance)));
    } catch (error) {
      console.error('Error recovering funds:', error);
      toast({
        title: 'Error',
        description: 'Failed to recover funds.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Flex p={2} bg="rgba(0, 0, 0, 0.91)" justify="space-between" align="center">
        <Flex align="right">
          <w3m-button />
        </Flex>
      </Flex>
      <Text fontSize="2xl" mb={4}>Pirate Pigz V2 Admin Panel</Text>

      <Box mb={4}>
        <Text fontSize="lg">Contract Balance: {contractBalance} MATIC</Text>
      </Box>
      <Box mb={4}>
        <Text fontSize="lg">Total Claim Value Payable: {totalClaimValue} MATIC</Text>
      </Box>

      <Box mb={4}>
        <Text fontSize="lg">Ensure Contract Balance equals the Claim Balance to cover the valid claims by users.</Text>
      </Box>

      <Box mb={4}>
        <Text fontSize="lg">Claiming Enabled: {claimingEnabled ? 'Yes' : 'No'}</Text>
        <Switch isChecked={claimingEnabled} onChange={toggleClaiming} />
      </Box>

      <Box mb={4}>
        <Text fontSize="lg">Pirate PigzV2 Registration and Claim Contract Address:</Text>
        <Text
          fontSize="md"
          color="blue.500"
          cursor="pointer"
          onClick={() => {
            onCopy();
            toast({
              title: 'Copied to clipboard',
              description: registerContractAddress,
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }}
        >
          {registerContractAddress}
        </Text>
        {hasCopied && <Text color="green.500" fontSize="sm">Address copied!</Text>}
      </Box>

      <Box mb={4}>
        <Text fontSize="lg">Valid Claims:</Text>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Address</Th>
              <Th isNumeric>Valid Count</Th>
              <Th isNumeric>Collected Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            {claimsData.map(({ address, claimCount, collectedCount }) => (
              <Tr key={address}>
                <Td>{`...${address.slice(-10)}`}</Td>
                <Td isNumeric>{claimCount}</Td>
                <Td isNumeric>{collectedCount}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <Button colorScheme="red" onClick={recoverFunds}>Recover Unclaimed Funds</Button>
    </Box>
  );
};

export default AdminPage;

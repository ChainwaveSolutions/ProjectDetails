import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
  useSwitchNetwork,
} from '@web3modal/ethers/react';
import {
  Box, Flex, Heading, Input, Button, Text, Image, Select,
} from '@chakra-ui/react';
import usdcABI from './usdcABI.json';

const TransferUSDC = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [transferPending, setTransferPending] = useState(false);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState(43113); // Default to Avalanche Fuji (example)

  const { provider } = useWeb3ModalProvider();
  const { account } = useWeb3ModalAccount();
  const { switchNetwork } = useSwitchNetwork();

  // Handle chain change and switch network
  const handleChainChange = async (newChainId) => {
    try {
      // Only switch if the network is different from the current one
      if (Number(newChainId) !== chainId) {
        await switchNetwork({ chainId: Number(newChainId) });
        setChainId(Number(newChainId));
      }
    } catch (error) {
      console.error('Failed to switch networks:', error);
    }
  };

  // Fetch USDC balance based on chainId and account
  useEffect(() => {
    const fetchBalance = async () => {
      const usdcContract = await getUsdcContract();
      if (usdcContract && account) {
        const userBalance = await usdcContract.balanceOf(account);
        setBalance(ethers.utils.formatUnits(userBalance, 6)); // USDC has 6 decimals
      }
    };

    if (account && provider) {
      fetchBalance();
    }
  }, [account, provider, chainId]); // Refetch balance when account, provider, or chainId changes

  // Get USDC Contract based on chainId
  const getUsdcContract = async () => {
    const contractAddressByChain = {
      43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // Avalanche Fuji
      11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia
      84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',   // Base Sepolia
      421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia
    };

    const usdcAddress = contractAddressByChain[chainId];

    if (provider && account && usdcAddress) {
      const signer = provider.getSigner();
      return new ethers.Contract(usdcAddress, usdcABI, signer);
    }
    return null;
  };

  // Handle Transfer USDC
  const handleTransfer = async () => {
    const usdcContract = await getUsdcContract();
    if (usdcContract) {
      setTransferPending(true);
      try {
        const parsedAmount = ethers.utils.parseUnits(amount, 6); // USDC has 6 decimals
        const tx = await usdcContract.transfer(recipient, parsedAmount);
        await tx.wait();
        setTransferPending(false);
        alert('Transfer successful');
      } catch (error) {
        console.error('Error during transfer:', error);
        setTransferPending(false);
      }
    }
  };

  return (
    <Box bg="gray.800" minH="100vh" color="white">
      {/* Header */}
      <Flex p={1} bg="rgba(0, 0, 0, 0.61)" justify="space-between" align="center">
        <Image p={0} ml="4" src="/images/textlogo.png" alt="Heading" width="160px" />
        <Flex align="right">
          <w3m-button />
        </Flex>
      </Flex>

      <Flex justifyContent="center" alignItems="center" flexDirection="column" maxW="600px" mx="auto">
        <Heading as="h2" size="xl" mb={6}>
          Send Funds from Chainwave
        </Heading>
        <Text fontSize="lg" mb={4}>Select the source chain and send USDC to another wallet.</Text>

        {/* Chain Selector */}
        <Box mb={4} w="full">
          <Text mb={2}>Source Chain</Text>
          <Select
            bg="gray.700"
            borderRadius="lg"
            value={chainId}
            onChange={(e) => handleChainChange(e.target.value)}
          >
            <option value="43113">Avalanche Fuji</option>
            <option value="11155111">Ethereum Sepolia</option>
            <option value="84532">Base Sepolia</option>
            <option value="421614">Arbitrum Sepolia</option>
          </Select>
        </Box>

        {/* Display User Balance */}
        <Box mb={4} w="full">
          <Text mb={2}>Your USDC Balance: {balance} USDC</Text>
        </Box>

        {/* Input for USDC Amount */}
        <Box mb={4} w="full">
          <Text mb={2}>Amount</Text>
          <Input
            bg="gray.700"
            borderRadius="lg"
            placeholder="Enter amount to send"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
          />
        </Box>

        {/* Input for Recipient Address */}
        <Box mb={4} w="full">
          <Text mb={2}>Recipient Wallet Address</Text>
          <Input
            bg="gray.700"
            borderRadius="lg"
            placeholder="Enter recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </Box>

        {/* Transfer Button */}
        <Button
          colorScheme="blue"
          w="full"
          size="lg"
          isLoading={transferPending}
          onClick={handleTransfer}
          disabled={transferPending || !amount || !recipient}
          borderRadius="lg"
        >
          Send USDC
        </Button>
      </Flex>
    </Box>
  );
};

export default TransferUSDC;

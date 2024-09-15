import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  Image,
  Input,
  Select,
  useToast,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';
import usdcbridgeABI from './usdctest01ABI.json';
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
  useSwitchNetwork,
} from '@web3modal/ethers/react';

// Source chain configuration: mapping chainId to contract details
// arb 3478487238524512106
// base 10344971235874465080
// sepolia 16015286601757825753
// fuji 14767482510784806043
const sourceChainConfig = {
  43113: {
    contractAddress: '0x88a91014AFc11533c85551379DD06F795F833CF6',
    usdcAddress: '0x5425890298aed601595a70AB815c96711a31Bc65',
    linkTokenAddress: '0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846',
    routerAddress: '0xF694E193200268f9a4868e4Aa017A0118C9a8177',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  },
  11155111: {
    contractAddress: '0xF3C4B9d464b0E6f04C3a40680Cf8245f8e92CDe8',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    linkTokenAddress: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
    routerAddress: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    rpcUrl: 'https://1rpc.io/sepolia',
  },
  84532: {
    contractAddress: '0xdB741e5A2E10fd827b553f51Bc8b5216FEc16A33',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    linkTokenAddress: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
    routerAddress: '0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93',
    rpcUrl: 'https://sepolia.base.org',
  },
  421614: {
    contractAddress: '0x4dFA6CF25d5BB20fC3E60a640Ad7a7523Ce01906',
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    linkTokenAddress: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
    routerAddress: '0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  },
};

// Destination chain configuration: mapping chainId to destinationChainSelector
const destinationChainConfig = {
  43113: { destinationChainSelector: 43113 },
  11155111: { destinationChainSelector: 11155111 },
  84532: { destinationChainSelector: 84532 },
  421614: { destinationChainSelector: 421614 },
};

const TransferUSDCPage = () => {
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const [useConnectedAddress, setUseConnectedAddress] = useState(true);
  const [selectedSourceChain, setSelectedSourceChain] = useState<string | null>(null);
  const [selectedDestinationChain, setSelectedDestinationChain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalSuccessful, setApprovalSuccessful] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const toast = useToast();

  // Web3Modal hooks
  const { open } = useWeb3Modal();
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { switchNetwork } = useSwitchNetwork();

  // Automatically set the connected wallet address as receiver
  useEffect(() => {
    if (useConnectedAddress && isConnected) {
      setReceiver(address);
    }
  }, [useConnectedAddress, address, isConnected]);

  // On page load, set the source chain to the current network chainId
  useEffect(() => {
    if (chainId) {
      setSelectedSourceChain(chainId.toString());
      console.log('Current Chain:', chainId);
    }
  }, [chainId]);

  // Handle network switch on source chain selection
  useEffect(() => {
    if (selectedSourceChain && switchNetwork) {
      switchNetwork(Number(selectedSourceChain));
      console.log('Switching to network:', selectedSourceChain);
    }
  }, [selectedSourceChain, switchNetwork]);

  // Fetch USDC balance when source chain or account changes
  useEffect(() => {
    const fetchUsdcBalance = async () => {
      if (isConnected && walletProvider && address) {
        try {
          const chainDetails = sourceChainConfig[selectedSourceChain];
          if (!chainDetails) return;

          const rpcProvider = new ethers.JsonRpcProvider(chainDetails.rpcUrl);
          const usdcContract = new ethers.Contract(chainDetails.usdcAddress, ['function balanceOf(address) view returns (uint256)'], rpcProvider);
          const balance = await usdcContract.balanceOf(address);
          setUsdcBalance(ethers.formatUnits(balance, 6));
          console.log('USDC Balance:', ethers.formatUnits(balance, 6));
        } catch (error) {
          console.error('Error fetching USDC balance:', error);
          setUsdcBalance('0');
        }
      }
    };

    fetchUsdcBalance();
  }, [selectedSourceChain, walletProvider, address, isConnected]);

  // Handle the approve logic
  const handleApprove = async () => {
    if (!amount || !selectedSourceChain) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a source chain and amount.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsApproving(true);
    try {
      if (!isConnected) {
        toast({
          title: 'Not Connected',
          description: 'Please connect a wallet to approve.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsApproving(false);
        return;
      }

      const signer = await new ethers.BrowserProvider(walletProvider).getSigner();
      const usdcContract = new ethers.Contract(
        sourceChainConfig[selectedSourceChain].usdcAddress,
        ['function approve(address spender, uint256 amount)'],
        signer
      );

      console.log('Approving contract:', sourceChainConfig[selectedSourceChain].contractAddress);
      console.log('USDC Contract for approval:', sourceChainConfig[selectedSourceChain].usdcAddress);

      const tx = await usdcContract.approve(
        sourceChainConfig[selectedSourceChain].contractAddress,
        ethers.parseUnits(amount, 6)
      );
      console.log('Approval transaction:', tx);
      await tx.wait();
      console.log('Approval transaction confirmed:', tx);

      setApprovalSuccessful(true);

      toast({
        title: 'Approval Successful',
        description: 'USDC approved for transfer.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Approval Failed:', error);
      toast({
        title: 'Approval Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsApproving(false);
  };

  // Handle transfer logic
  const handleTransfer = async () => {
    if (!amount || !receiver || !selectedSourceChain || !selectedDestinationChain) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a valid amount and ensure both source and destination chains are selected.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!isConnected) {
        toast({
          title: 'Not Connected',
          description: 'Please connect a wallet to perform the transfer.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      const signer = await new ethers.BrowserProvider(walletProvider).getSigner();
      const contractAddress = sourceChainConfig[selectedSourceChain].contractAddress;
      const destinationChainSelector = destinationChainConfig[selectedDestinationChain].destinationChainSelector;

      const contract = new ethers.Contract(contractAddress, usdcbridgeABI, signer);

      const tx = await contract.transferUsdc(Number(selectedDestinationChain), receiver, ethers.parseUnits(amount, 6));
      await tx.wait();

      toast({
        title: 'Transfer Successful',
        description: `USDC transferred successfully to ${receiver} on destination chain ${selectedDestinationChain}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Transfer Failed:', error);
      toast({
        title: 'Transfer Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  // Swap source and destination chains
  const handleSwapChains = () => {
    setSelectedSourceChain((prevSourceChain) => {
      setSelectedDestinationChain(prevSourceChain);
      return selectedDestinationChain;
    });
  };

  const isTransferDisabled = !amount || !selectedDestinationChain || !isConnected;

  return (
    <>
      <Flex p={1} bg="rgba(0, 0, 0, 0.61)" justify="space-between" align="center">
        <Image p={0} ml="4" src="/images/textlogo.png" alt="Heading" width="220px" />
        <Flex align="right">
          <w3m-button />
        </Flex>
      </Flex>

      <Box maxW="600px" mx="auto" py={10}>
        <Heading as="h2" mb={6} textAlign="center">
          Transfer USDC
        </Heading>

        {/* Source Chain Dropdown (Selects Contract) */}
        <Select
          placeholder="Select Source Chain"
          value={selectedSourceChain || ''}
          onChange={(e) => setSelectedSourceChain(e.target.value)}
        >
          <option value="43113">Avalanche Fuji Testnet</option>
          <option value="11155111">Ethereum Sepolia</option>
          <option value="84532">Base Sepolia</option>
          <option value="421614">Arbitrum Sepolia</option>
        </Select>

        {/* Swap Button */}
        <Flex justify="center" my={4}>
          <IconButton
            aria-label="Swap chains"
            icon={<FaExchangeAlt />}
            onClick={handleSwapChains}
          />
        </Flex>

        {/* Destination Chain Dropdown (Selects destinationChainSelector) */}
        <Select
          placeholder="Select Destination Chain"
          value={selectedDestinationChain}
          onChange={(e) => setSelectedDestinationChain(e.target.value)}
          mt={4}
        >
          <option value="43113">Avalanche Fuji Testnet</option>
          <option value="11155111">Ethereum Sepolia</option>
          <option value="84532">Base Sepolia</option>
          <option value="421614">Arbitrum Sepolia</option>
        </Select>

        <Checkbox
          isChecked={useConnectedAddress}
          onChange={(e) => setUseConnectedAddress(e.target.checked)}
          mt={4}
        >
          Use Connected Wallet Address as Receiver
        </Checkbox>

        <Flex direction="column" gap={4} mt={4} position="relative">
          <Input
            placeholder="Receiver address"
            value={useConnectedAddress ? address : receiver}
            onChange={(e) => setReceiver(e.target.value)}
            isDisabled={useConnectedAddress}
          />

          <Input
            placeholder="Amount to transfer"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Text fontSize="sm" textAlign="right" mt={-3} color="gray.500">
            Balance: {usdcBalance} USDC
          </Text>

          <Button
            colorScheme="teal"
            isLoading={isApproving}
            onClick={handleApprove}
            isDisabled={!amount || isApproving || approvalSuccessful}
          >
            {approvalSuccessful ? <FaCheckCircle /> : `Approve $${amount || 0} USDC`}
          </Button>

          <Button
            colorScheme="blue"
            isLoading={isLoading}
            onClick={handleTransfer}
            isDisabled={isTransferDisabled}
          >
            Transfer USDC
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export default TransferUSDCPage;

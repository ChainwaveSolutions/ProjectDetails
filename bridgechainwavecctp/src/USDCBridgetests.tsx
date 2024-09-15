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
  Link,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';

import Footer from './Components/Footer/Footer';
import usdcbridgeABI from './usdctest01ABI.json';
import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
  useSwitchNetwork,
} from '@web3modal/ethers/react';

// Source chain configuration: mapping chainId to contract details
const sourceChainConfig = {
  43113: {
    contractAddress: '0x88a91014AFc11533c85551379DD06F795F833CF6',
    usdcAddress: '0x5425890298aed601595a70AB815c96711a31Bc65',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  },
  11155111: {
    contractAddress: '0xF3C4B9d464b0E6f04C3a40680Cf8245f8e92CDe8',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    rpcUrl: 'https://1rpc.io/sepolia',
  },
  84532: {
    contractAddress: '0xdB741e5A2E10fd827b553f51Bc8b5216FEc16A33',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    rpcUrl: 'https://sepolia.base.org',
  },
  421614: {
    contractAddress: '0x4dFA6CF25d5BB20fC3E60a640Ad7a7523Ce01906',
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
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
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const toast = useToast();

  // Web3Modal hooks
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (useConnectedAddress && isConnected && address) {
      setReceiver(address as string);
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
      if (isConnected && walletProvider && address && selectedSourceChain) {
        try {
          const chainId = parseInt(selectedSourceChain); // Convert the string to a number
          if (!Object.keys(sourceChainConfig).includes(selectedSourceChain)) {
            console.error('Invalid source chain selected');
            return;
          }

          const chainDetails = sourceChainConfig[chainId as keyof typeof sourceChainConfig]; // Safe cast after validation

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

  // Handle approval logic
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

      if (!walletProvider) {
        toast({
          title: 'No Wallet Provider',
          description: 'Please connect your wallet to proceed.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsApproving(false);
        return;
      }

      const signer = await new ethers.BrowserProvider(walletProvider as ethers.Eip1193Provider).getSigner();
      const chainId = Number(selectedSourceChain);

      const usdcContract = new ethers.Contract(
        sourceChainConfig[chainId as keyof typeof sourceChainConfig].usdcAddress,
        ['function approve(address spender, uint256 amount)'],
        signer
      );

      const tx = await usdcContract.approve(
        sourceChainConfig[chainId as keyof typeof sourceChainConfig].contractAddress,
        ethers.parseUnits(amount, 6)
      );
      await tx.wait();

      setApprovalSuccessful(true);

      toast({
        title: 'Approval Successful',
        description: 'USDC approved for transfer.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Approval Failed:', error);
      toast({
        title: 'Approval Failed',
        description: error.message || 'An unknown error occurred',
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

      const signer = await new ethers.BrowserProvider(walletProvider as ethers.Eip1193Provider).getSigner();
      const chainId = Number(selectedSourceChain);

      const contract = new ethers.Contract(
        sourceChainConfig[chainId as keyof typeof sourceChainConfig].contractAddress,
        usdcbridgeABI,
        signer
      );

      const tx = await contract.transferUsdc(Number(selectedDestinationChain), receiver, ethers.parseUnits(amount, 6));
      await tx.wait();

      setTransactionHash(tx.hash); // Set transaction hash
      setTransactionStatus('Transaction sent to CCIP'); // Set status to "Transaction sent to CCIP"

      toast({
        title: 'Transfer Successful',
        description: `USDC transferred successfully to ${receiver} on destination chain ${selectedDestinationChain}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Transfer Failed:', error);
      toast({
        title: 'Transfer Failed',
        description: error.message || 'An unknown error occurred',
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
      setSelectedDestinationChain(prevSourceChain || '');
      return selectedDestinationChain;
    });
  };



  const chainlinkExplorerUrl = transactionHash
    ? `https://ccip.chain.link/tx/${transactionHash}`
    : '#';

  const isTransferDisabled = !amount || !selectedDestinationChain || !isConnected;



  const chainLogos: { [key: number]: string } = {
    43113: 'https://thatdamndawg.com/images/networklogos/avax.png',
    421614: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
    11155111: '/images/sepolia.png',
    84532: '/images/base.png',
  };

  // Use the number conversion for accessing chainLogos
  const sourceChainLogo = selectedSourceChain ? chainLogos[Number(selectedSourceChain)] : null;
  const destinationChainLogo = selectedDestinationChain ? chainLogos[Number(selectedDestinationChain)] : null;


  return (
    <Box bg="gray.800" minH="100vh" color="white">
      {/* Header */}
      <Flex p={1} bg="rgba(0, 0, 0, 0.61)" justify="space-between" align="center">
        <Image p={0} ml="4" src="/images/textlogo.png" alt="Heading" width="160px" />
        <Flex align="right">
          <w3m-button />
        </Flex>
      </Flex>

      {/* Main content */}
      <Box p={4} maxW="600px" mx="auto" py={10}>
        <Heading as="h2" mb={6} textAlign="center">
          Transfer Funds with Chainwave
        </Heading>

        <Text fontSize="sm" textAlign="center" mt={2} mb={6} color="gray.400">
          Bridging your USDC to another Network
        </Text>

        <Box flex="1" display="flex" justifyContent="center" alignItems="center" width={{ base: '100%', md: '100%' }}>
          <Image mb={6} src="https://tokens.pancakeswap.finance/images/0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3.png" alt="Image 3" objectFit="cover" width="20%" />
        </Box>

        <Text fontSize="lg" textAlign="center" color="gray.200">
          Current Balance
        </Text>

        <Text fontSize="5xl" textAlign="center" mt={2} mb={6} color="gray.200">
          {usdcBalance} USDC
        </Text>

        {/* Source Chain Dropdown */}
        <Select
          placeholder="Select Source Chain"
          value={selectedSourceChain || ''}
          onChange={(e) => setSelectedSourceChain(e.target.value)}
          mb={4}
          borderRadius="full"
        >
          <option value="43113">
            <Image src={chainLogos[43113]} alt="Avalanche" boxSize="20px" mr={2} display="inline" /> Avalanche Fuji Testnet
          </option>
          <option value="11155111">
            <Image src={chainLogos[11155111]} alt="Sepolia" boxSize="20px" mr={2} display="inline" /> Ethereum Sepolia
          </option>
          <option value="84532">
            <Image src={chainLogos[84532]} alt="Base" boxSize="20px" mr={2} display="inline" /> Base Sepolia
          </option>
          <option value="421614">
            <Image src={chainLogos[421614]} alt="Arbitrum" boxSize="20px" mr={2} display="inline" /> Arbitrum Sepolia
          </option>
        </Select>

        {/* Swap Button */}
        <Flex justify="center" my={4}>
          <IconButton aria-label="Swap chains" icon={<FaExchangeAlt />} onClick={handleSwapChains} borderRadius="full" />
        </Flex>

        {/* Destination Chain Dropdown */}
        <Select
          placeholder="Select Destination Chain"
          value={selectedDestinationChain}
          onChange={(e) => setSelectedDestinationChain(e.target.value)}
          mt={4}
          borderRadius="full"
        >
          <option value="43113">
            <Image src={chainLogos[43113]} alt="Avalanche" boxSize="20px" mr={2} display="inline" /> Avalanche Fuji Testnet
          </option>
          <option value="11155111">
            <Image src={chainLogos[11155111]} alt="Sepolia" boxSize="20px" mr={2} display="inline" /> Ethereum Sepolia
          </option>
          <option value="84532">
            <Image src={chainLogos[84532]} alt="Base" boxSize="20px" mr={2} display="inline" /> Base Sepolia
          </option>
          <option value="421614">
            <Image src={chainLogos[421614]} alt="Arbitrum" boxSize="20px" mr={2} display="inline" /> Arbitrum Sepolia
          </option>
        </Select>

        {/* Use Connected Address Checkbox */}
        <Checkbox isChecked={useConnectedAddress} onChange={(e) => setUseConnectedAddress(e.target.checked)} mt={4}>
          Use Connected Wallet Address as Receiver
        </Checkbox>

        {/* Input Fields */}
        <Flex direction="column" gap={4} mt={4} position="relative">
          <Input
            placeholder="Receiver address"
            value={useConnectedAddress ? address : receiver}
            onChange={(e) => setReceiver(e.target.value)}
            isDisabled={useConnectedAddress}
            borderRadius="full"
          />

          <Input
            placeholder="Amount to transfer"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            borderRadius="full"
          />

          <Text fontSize="sm" textAlign="right" mt={-3} color="gray.500">
            Balance: {usdcBalance} USDC
          </Text>

          {/* Approve Button */}
          <Button
            colorScheme="blue"
            isLoading={isApproving}
            onClick={handleApprove}
            isDisabled={!amount || isApproving || approvalSuccessful}
            borderRadius="full"
          >
            {approvalSuccessful ? <FaCheckCircle /> : `Approve $${amount || 0} USDC`}
          </Button>

          {/* Transfer Button */}
          <Button
            colorScheme="blue"
            isLoading={isLoading}
            onClick={handleTransfer}
            isDisabled={isTransferDisabled}
            borderRadius="full"
          >
            Transfer USDC
          </Button>

          {/* Transaction Details */}
          {transactionHash && (
            <>
              {transactionStatus && (
                <Text mt={4} color="gray.400">
                  Status: {transactionStatus}
                </Text>
              )}
              <Link href={chainlinkExplorerUrl} isExternal color="blue.500" mt={2}>
                View Chainlink Transaction Status
              </Link>
            </>
          )}


          <Text fontSize="lg" textAlign="center" mt={8} mb={-4}  color="gray.200">
            Powered by
          </Text>
          <Box flex="1" display="flex" justifyContent="center" alignItems="center" width={{ base: '100%', md: '100%' }}>
            <Image src="/images/textlogochainwave.png" alt="Image 3" objectFit="cover" width="60%" />
          </Box>

                                        <Text fontSize="sm" textAlign="center"   color="gray.200">
                                          with Technologies by
                                        </Text>
          <Flex  direction={{ base: 'column', md: 'row' }} justifyContent="center" alignItems="center">


            <Box flex="1" display="flex" justifyContent="center" alignItems="center" width={{ base: '100%', md: '100%' }}>
              <Image src="/images/chainlinkwhite.png" alt="Image 1" objectFit="cover" width="35%" />
            </Box>

            <Box flex="1" display="flex" justifyContent="center" alignItems="center" width={{ base: '100%', md: '100%' }}>
              <Image src="/images/circlewhite.png" alt="Image 2" objectFit="cover" width="35%" />
            </Box>
          </Flex>

        </Flex>

                                      <Link href="https://faucets.chain.link/" isExternal>
                                        <Text color="blue.500" mt="25px" fontSize="sm" mb={2}>Testnet Tokens Faucet Link</Text>
                                      </Link>

                                      <Link href="https://faucet.circle.com/" isExternal>
                                        <Text color="blue.500" mt="25px" fontSize="sm" mb={2}>USDC Faucet Link</Text>
                                      </Link>
      </Box>

    </Box>
  );
};

export default TransferUSDCPage;

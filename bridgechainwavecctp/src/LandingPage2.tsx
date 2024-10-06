import React from 'react';
import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  Select,
  Text,
  Divider,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { FaDollarSign, FaCheckCircle } from 'react-icons/fa';

export default function OnrampComponent() {
  return (
    <Box  bgGradient="linear(to-r, #19072b, #4567c4)" color="white"
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      textAlign="center"
    >
      {/* First Row: Image */}
      <Flex justifyContent="center" mb={4}>
        <Image p={6} src="/images/textlogo.png" alt="Onramp" mx="auto" borderRadius="full" />
      </Flex>

      {/* Second Row: Heading */}
      <Text color="white" fontSize="xl" fontWeight="bold" mb={4}
      mt="30px" >
        Buy Crypto with USD
      </Text>

      <Divider mb={4} />

      {/* Third Row: Pay Input Box */}
      <Flex align="center" mb={4}>
        <InputGroup>
          <Input placeholder="Enter amount" type="number" />
          <InputRightElement children={<FaDollarSign  />} />
        </InputGroup>
      </Flex>



      <Flex direction="column" mb="150px">
        <Select placeholder="Select Crypto Currency">
          <option value="usdc">USDC</option>
          <option value="usdt">USDT</option>
          <option value="dai">DAI</option>
        </Select>
        <Input
          placeholder="Amount Received"
          mt="30px"
          readOnly
          bg="gray.100"
        />
      </Flex>

      <Divider mb={4} />

      {/* Fifth Row: Fees */}
      <Flex justifyContent="space-between" mb={2}>
        <Text fontSize="md" color="white">Fees</Text>
        <Text fontSize="md" fontWeight="bold">$0.00</Text>
      </Flex>

      {/* Sixth Row: Total */}
      <Flex justifyContent="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color="white">Total</Text>
        <Text fontSize="lg" fontWeight="bold" color="white">$0.00</Text>
      </Flex>

      <Divider mb="100px" />

      {/* Seventh Row: Additional Info Text */}
      <Text fontSize="sm" color="white" mb={12}>
        Exchange rates may vary. Please confirm details before proceeding.
      </Text>

      {/* Eighth Row: Confirm Purchase Button */}
      <Button
        bgGradient="linear(to-r, #4567c4, #19072b)" color="white"
        leftIcon={<FaCheckCircle />}
        width="100%"
        py={6}
        fontSize="lg"
      >
        Confirm Purchase
      </Button>
    </Box>
  );
}

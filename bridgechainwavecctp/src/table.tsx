// src/pages/ComparisonTable.tsx
import React from 'react';
import { Box, Image, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import tickImage from '../assets/tick.png'; // Replace with the correct path to the tick image

const ComparisonTable = () => {
  const tableData = [
    { feature: 'Fiat to Crypto On-Ramp', stripe: '', payoneer: '', paypal: '', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Supported Cryptocurrencies', stripe: '', payoneer: 'Yes', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'User Wallet Support', stripe: '', payoneer: '', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Crypto Withdrawal', stripe: '', payoneer: '', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Mobile App Availability', stripe: 'Yes', payoneer: 'Yes', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'KYC/AML Compliance', stripe: 'Yes', payoneer: 'Yes', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Merchant Services', stripe: 'Yes', payoneer: 'Yes', paypal: 'Yes', coinbase: '', chainwave: 'Yes' },
    { feature: 'Instant Transfers', stripe: 'Yes', payoneer: '', paypal: '', coinbase: '', chainwave: 'Yes' },
    { feature: 'Crypto to Fiat Off-Ramp', stripe: '', payoneer: '', paypal: '', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Location Based Mapping', stripe: '', payoneer: '', paypal: '', coinbase: '', chainwave: 'Yes' }
  ];

  const renderTick = (entry: string) => (
    entry === 'Yes' ? <Image src={tickImage} alt="tick" boxSize="20px" /> : entry
  );

  return (
    <Box p={6}>
      <Table variant="simple" size="lg" border="1px solid black">
        <Thead>
          <Tr>
            <Th>Feature</Th>
            <Th>Stripe</Th>
            <Th>Payoneer</Th>
            <Th>PayPal</Th>
            <Th>Coinbase</Th>
            <Th>ChainWave</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tableData.map((row, index) => (
            <Tr key={index}>
              <Td>{row.feature}</Td>
              <Td>{renderTick(row.stripe)}</Td>
              <Td>{renderTick(row.payoneer)}</Td>
              <Td>{renderTick(row.paypal)}</Td>
              <Td>{renderTick(row.coinbase)}</Td>
              <Td>{renderTick(row.chainwave)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ComparisonTable;

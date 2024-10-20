import React from 'react';
import { Box, Image, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import tickImage from '/images/check.png';
import redXImage from '/images/redx.png';
import stripeLogo from '/images/stripe.png';
import payoneerLogo from '/images/payoneer.png';
import paypalLogo from '/images/paypal.png';
import coinbaseLogo from '/images/coinbase.png';
import chainwaveLogo from '/images/chainwave.png';

const ComparisonTable = () => {
  const tableData = [
    { feature: 'Mobile App Availability', stripe: 'Yes', payoneer: 'Yes', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'KYC/AML Compliance', stripe: 'Yes', payoneer: 'Yes', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Merchant Services', stripe: 'Yes', payoneer: 'Yes', paypal: 'Yes', coinbase: '', chainwave: 'Yes' },
    { feature: 'Supported Cryptocurrencies', stripe: '', payoneer: 'Yes', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'User Wallet Support', stripe: '', payoneer: '', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Crypto Withdrawal', stripe: '', payoneer: '', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Fiat to Crypto On-Ramp', stripe: '', payoneer: '', paypal: 'Yes', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Crypto to Fiat Off-Ramp', stripe: '', payoneer: '', paypal: '', coinbase: 'Yes', chainwave: 'Yes' },
    { feature: 'Instant Transfers', stripe: 'Yes', payoneer: '', paypal: '', coinbase: '', chainwave: 'Yes' },
    { feature: 'Location Based Mapping', stripe: '', payoneer: '', paypal: '', coinbase: '', chainwave: 'Yes' }
  ];

  const renderIcon = (entry: string) => (
    entry === 'Yes' ? (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Image src={tickImage} alt="tick" boxSize="12px" borderRadius="full" />
      </Box>
    ) : (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Image src={redXImage} alt="red x" boxSize="12px" />
      </Box>
    )
  );

  return (
    <Box p={2}>
      <Table variant="simple" size="sm" border="0px solid black" width="100%">
        <Thead>
          <Tr>
            <Th border="0px solid black" color="white" fontSize={["xs", "sm", "md"]} whiteSpace="normal" wordBreak="break-word">
              Feature
            </Th>

            {/* Compact name and logo alignment */}
            <Th textAlign="center" border="0px solid black" p={1}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Image src={stripeLogo} alt="Stripe" height="30px"   mb={1} />
                <Box fontSize={["xx-small", "xs", "sm"]} lineHeight="1" color="white" textAlign="center">Stripe</Box>
              </Box>
            </Th>
            <Th textAlign="center" border="0px solid black" p={1}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Image src={payoneerLogo} alt="Payoneer" height="30px"   mb={1} />
                <Box fontSize={["xx-small", "xs", "sm"]} lineHeight="1" color="white" textAlign="center">Payoneer</Box>
              </Box>
            </Th>
            <Th textAlign="center" border="0px solid black" p={1}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Image src={paypalLogo} alt="PayPal" height="30px"   mb={1} />
                <Box fontSize={["xx-small", "xs", "sm"]} lineHeight="1" color="white" textAlign="center">PayPal</Box>
              </Box>
            </Th>
            <Th textAlign="center" border="0px solid black" p={1}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Image src={coinbaseLogo} alt="Coinbase" height="30px"   mb={1} />
                <Box fontSize={["xx-small", "xs", "sm"]} lineHeight="1" color="white" textAlign="center">Coinbase</Box>
              </Box>
            </Th>
            <Th textAlign="center" border="0px solid black" p={1}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Image src={chainwaveLogo} alt="ChainWave" height="30px"   mb={1} />
                <Box fontSize={["xx-small", "xs", "sm"]} lineHeight="1" color="white" textAlign="center">ChainWave</Box>
              </Box>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {tableData.map((row, index) => (
            <Tr key={index}>
              <Td border="0px solid black" fontSize={["xx-small", "xs", "sm"]} whiteSpace="normal" wordBreak="break-word">
                {row.feature}
              </Td>
              <Td border="0px solid black" p={1}>{renderIcon(row.stripe)}</Td>
              <Td border="0px solid black" p={1}>{renderIcon(row.payoneer)}</Td>
              <Td border="0px solid black" p={1}>{renderIcon(row.paypal)}</Td>
              <Td border="0px solid black" p={1}>{renderIcon(row.coinbase)}</Td>
              <Td border="0px solid black" p={1}>{renderIcon(row.chainwave)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ComparisonTable;

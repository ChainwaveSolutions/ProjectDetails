import React, { useState, useEffect } from 'react';
import { Box, Image, Flex, Text } from '@chakra-ui/react';
import { css, keyframes } from '@emotion/react';
import { Link } from 'react-router-dom'; 
import Footer from './Components/Footer/Footer';
//
// <Footer />




const NewPage = () => {



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


        <Box
          flex={1}
          p={0}
          m={0}
          bg="rgba(0, 0, 0, 0.65)"
          display="flex"
          flexDirection="column"
          color="white"
          >

                    <Flex p={1} bg="rgba(0, 0, 0, 0.61)" justify="space-between" align="center">
                      <Link to="/">
                        <Image p={0} ml="4" src="/images/textlogo.png" alt="Heading" width="220px" />
                      </Link>
                      <Flex   align="right">

                      <w3m-button />
                    </Flex>
                    </Flex>


          </Box>
        </Box>
      <Footer />





    </>
  );
};

export default NewPage;

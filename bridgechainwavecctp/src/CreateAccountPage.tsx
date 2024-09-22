import React, { useState } from 'react';
import { Box, Button, Input, Heading } from '@chakra-ui/react';

const CreateAccountPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Save the user's additional data if necessary
    console.log('Account created:', formData);
  };

  return (
    <Box textAlign="center" p={8} bg="gray.800" color="white" maxW="600px" mx="auto" mt={8}>
      <Heading as="h2" mb={6}>Create Your ChainWave Account</Heading>
      <Input
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleInputChange}
        required
      />
      <Input
        type="email"
        name="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleInputChange}
        required
        mt={4}
      />
      <Button onClick={handleSubmit} colorScheme="blue" size="lg" mt={6}>
        Create Account
      </Button>
    </Box>
  );
};

export default CreateAccountPage;

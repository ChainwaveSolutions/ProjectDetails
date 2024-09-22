import React, { useState } from 'react';
import { Box, Button, Input, Textarea, Heading, Flex, Text } from '@chakra-ui/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import your Firestore setup

const RegisterInterestForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "interests"), formData); // Save form data to Firestore
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form: ", error);
    }
  };

  return (
    <Box textAlign="center" p={8} bg="gray.800" color="white" maxW="600px" mx="auto" mt={8}>
      <Heading as="h2" mb={6}>Register Your Interest</Heading>
      {submitted ? (
        <Text fontSize="lg" color="green.400">Thank you! We've received your interest.</Text>
      ) : (
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap={4}>
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
            />
            <Textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleInputChange}
            />
            <Button type="submit" colorScheme="blue" size="lg">
              Submit
            </Button>
          </Flex>
        </form>
      )}
    </Box>
  );
};

export default RegisterInterestForm;

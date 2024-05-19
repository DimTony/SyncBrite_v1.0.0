import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => {
    setShow(!show);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!data.email || !data.password) {
      toast({
        title: "Please fill all required fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const response = await axios.post("/api/users/login", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast({
          title: "Logged in successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
        localStorage.setItem("UserInfo", JSON.stringify(response.data));
        setLoading(false);
        navigate("/chats");
      }
    } catch (error) {
      toast({
        title: "Error creating user!",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="login-email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          // onChange={(e) => setEmail(e.target.value)}
          name="email"
          onChange={handleChange}
          value={data.email}
        />
      </FormControl>
      <FormControl id="login-password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            // onChange={(e) => setPassword(e.target.value)}
            name="password"
            onChange={handleChange}
            value={data.password}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={handleSubmit}
      >
        Login
      </Button>
      <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        onClick={() => {
          setData({
            email: "guest@syncbrite.com",
            password: "123456",
          });
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;

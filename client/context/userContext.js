import axios from "axios";
import { useRouter } from "next/navigation";
import React, { createContext, useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";

const UserContext = React.createContext();

export const UserContextProvider = ({ children }) => {
  const serverUrl = "http://localhost:8000";

  const router = useRouter();

  const [user, setUser] = useState(null);
  const [userState, setUserState] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    identifier: "",
  });

  const [loading, setLoading] = useState(false);

  //register user
  const registerUser = async (e) => {
    e.preventDefault();

    if (
      !userState.email.includes("@") ||
      !userState.password ||
      userState.password.length < 8 ||
      !userState.username
    ) {
      toast.error(
        "Please enter a valid email or username and password (min 8 characters)"
      );
      return;
    }

    try {
      const res = await axios.post(`${serverUrl}/api/v1/register`, userState);
      toast.success("User registered successfully");
      console.log("User registered successfully", res.data);

      setUserState({
        name: "",
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.log("Error registering user", error);
      toast.error(error.response.data.message);
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${serverUrl}/api/v1/login`,
        {
          identifier: userState.identifier,
          password: userState.password,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("User logged in successfully");

      setUserState({
        identifier: "",
        password: "",
      });

      await getUser();

      router.push("/");
    } catch (error) {
      console.log("Error registering user", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const handlerUserInput = (name) => (e) => {
    const value = e.target.value;

    setUserState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <UserContext.Provider
      value={{ registerUser, userState, loginUser, handlerUserInput }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const userUserContext = () => {
  return useContext(UserContext);
};

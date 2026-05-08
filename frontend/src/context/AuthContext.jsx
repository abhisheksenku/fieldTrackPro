import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    return storedUserInfo ? JSON.parse(storedUserInfo) : null;
  });
  useEffect(() => {
    const syncUser = async () => {
      try {
        if (!userInfo?.token) return;

        const { data } = await api.get("/auth/me");

        const updatedUserInfo = {
          ...userInfo,
          user: data.user,
        };

        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

        setUserInfo(updatedUserInfo);
      } catch (error) {
        logoutAction();
      }
    };

    syncUser();
  }, []);
  const loginAction = (userData) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setUserInfo(userData);
  };
  const logoutAction = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
  };
  return (
    <AuthContext.Provider value={{ userInfo, loginAction, logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(()=>{
        const storedUserInfo = localStorage.getItem('userInfo');
        return storedUserInfo ? JSON.parse(storedUserInfo) : null;
    });
    const loginAction = (userData)=>{
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUserInfo(userData);
    }
    const logoutAction = ()=>{
        localStorage.removeItem('userInfo');
        setUserInfo(null);
    }
    return (
        <AuthContext.Provider value={{ userInfo, loginAction, logoutAction }}>
            {children}
        </AuthContext.Provider>
    )
};
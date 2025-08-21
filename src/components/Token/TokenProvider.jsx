import React, { createContext, useContext } from 'react';
import axios from 'axios';

const TokenContext = createContext({
  getToken: () => null,
  setToken: () => {},
  removeToken: () => {},
  isTokenValid: () => true,
});

export const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  // 토큰 가져오기
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // 토큰 저장 (axios 헤더 자동 설정)
  const setToken = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // 토큰 삭제 (헤더도 삭제)
  const removeToken = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // 토큰 유효성 검사 (JWT exp 확인)
  const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  return (
    <TokenContext.Provider value={{ getToken, setToken, removeToken, isTokenValid }}>
      {children}
    </TokenContext.Provider>
  );
};

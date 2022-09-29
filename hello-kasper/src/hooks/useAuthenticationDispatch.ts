import { useContext } from 'react';
import { AuthenticationDispatch } from '../context/Authentication/AuthenticationDispatch';

const useAuthenticationDispatch = () => {
  return useContext(AuthenticationDispatch);
};

export { useAuthenticationDispatch };

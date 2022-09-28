import { useContext } from 'react';
import { AuthenticationDispatch } from '../context/Authentication/AuthenticationContextProvider';

const useAuthenticationDispatch = () => {
  return useContext(AuthenticationDispatch);
};

export { useAuthenticationDispatch };

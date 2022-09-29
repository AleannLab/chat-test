import { useContext } from "react";
import { AuthenticationContext } from "../context/Authentication/AuthenticationContext";

const useAuthenticationState = () => {
  return useContext(AuthenticationContext);
};

export { useAuthenticationState };

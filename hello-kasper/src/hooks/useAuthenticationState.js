import { useContext } from "react";
import { AuthenticationContext } from "../context/Authentication/AuthenticationContextProvider";

const useAuthenticationState = () => {
  return useContext(AuthenticationContext);
};

export { useAuthenticationState };

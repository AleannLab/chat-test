import { createContext } from "react";
import { StateAuthentication } from "./authentication";
const AuthenticationContext = createContext<StateAuthentication>({} as StateAuthentication);

export { AuthenticationContext };

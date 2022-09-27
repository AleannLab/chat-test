import React from "react";
import { storesContext } from "../stores/index";

export const useStores = () => React.useContext(storesContext);

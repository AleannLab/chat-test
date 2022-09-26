import { useContext } from 'react';
import { OfficeChatDispatch } from 'context/OfficeChat/OfficeChatContextProvider';

const useOfficeChatDispatch = () => {
  return useContext(OfficeChatDispatch);
};

export { useOfficeChatDispatch };

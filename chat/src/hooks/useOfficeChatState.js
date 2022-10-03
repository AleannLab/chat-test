import { useContext } from 'react';
import { OfficeChatContext } from 'context/OfficeChat/OfficeChatContextProvider';

const useOfficeChatState = () => {
  return useContext(OfficeChatContext);
};

export { useOfficeChatState };

import { useState } from 'react';
import { useStores } from './useStores';

export function useAuthToken() {
  const [authToken, setAuthToken] = useState('');
  const { authentication } = useStores();
  authentication.refreshAndGetSession({}).then((session) => {
    setAuthToken(session.getAccessToken().getJwtToken());
  });
  return authToken;
}

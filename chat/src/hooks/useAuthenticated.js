import { useHistory, useRouteMatch } from 'react-router-dom';
import { useStores } from './useStores';
import { useObserver } from 'mobx-react';

export function useAuthenticated() {
  const { authentication } = useStores();
  const history = useHistory();
  const match = useRouteMatch('/:slug');
  useObserver(() => {
    if (authentication.loadedAuth && !authentication.authenticatedData) {
      history.replace(`/login?redirect_to=${match.url}`);
    }
  });
  // if (!authentication.workspace) return history.replace("/workspace");
  return {
    loading: authentication.loadedAuth,
    authenticationData: authentication.authenticatedData,
  };
}

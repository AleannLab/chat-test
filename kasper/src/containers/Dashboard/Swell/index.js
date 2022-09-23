import React from 'react';
import IframeResizer from 'iframe-resizer-react';
import { useStores } from 'hooks/useStores';
import { useQuery, useQueryClient } from 'react-query';
import Loader from 'components/Core/Loader';
import HeadComp from 'components/SEO/HelmetComp';

export default function Swell() {
  const { integrations, notification } = useStores();
  const queryClient = useQueryClient();

  // get cached data for integration config
  const cachedData = queryClient.getQueryData([
    'officeConfigs',
    'integrations',
  ]);

  // React query to fetch integration config
  const integrationsQuery = useQuery(
    ['officeConfigs', 'integrations'],
    () => integrations.getConfigs('swell_integration_token_id'),
    {
      enabled: !cachedData,
      initialData: cachedData,
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  return (
    <>
      <HeadComp title="Swell" />
      <Loader
        show={integrationsQuery.isFetching}
        message="Loading Swell Dashboard..."
      >
        {integrationsQuery.isSuccess ? (
          <IframeResizer
            src={`https://platform.swellcx.com/token-login?token=${integrationsQuery.data.swell_integration_token_id}`}
            style={{
              width: '100%',
              height: 'calc(100vh - 64px)',
            }}
            frameBorder={0}
            scrolling={true}
            title="Swell"
          />
        ) : null}
      </Loader>
    </>
  );
}

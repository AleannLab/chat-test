import React from 'react';
import styles from './index.module.css';
import Table from 'components/Core/Table';
import { useStores } from 'hooks/useStores';
import {
  useIsFetching,
  useMutation,
  useQuery,
  useQueryClient,
  useIsMutating,
} from 'react-query';
import LinearProgress from '@material-ui/core/LinearProgress';
import Settings from '@material-ui/icons/Settings';
import { IconButton } from '@material-ui/core';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import Configuration from './Configuration';
import Editable from 'components/Core/Editable';
import { PHONE_MODEL } from '../../../../../helpers/constants';

const Label = ({ id: phoneID, name, status }) => {
  const { hardwarePhones } = useStores();
  const queryClient = useQueryClient();
  const isFetchingHardwarePhones = useIsFetching(['hardwarePhones']);

  const { mutateAsync: updateHardwarePhone, isLoading: updating } = useMutation(
    'updateHardwarePhone',
    ({ data, id }) => hardwarePhones.updateHardwarePhone({ data, id }),
    { onSuccess: () => queryClient.invalidateQueries('hardwarePhones') },
  );

  const hardwarePhonesData = queryClient.getQueryData(['hardwarePhones']);

  const isDuplicate = (text) =>
    hardwarePhonesData?.find(
      ({ fullname, id }) => fullname === text?.trim() && id !== phoneID,
    );

  return (
    <div className={styles.labelStatusContainer}>
      <span
        className={status === 1 ? styles.valueActive : styles.valueInactive}
      >
        <Editable
          fieldName="label"
          allowSpecialChars={false}
          loading={isFetchingHardwarePhones || updating}
          text={name}
          onUpdate={(newText) =>
            updateHardwarePhone({ data: { fullname: newText }, id: phoneID })
          }
          yupValidation={{
            error: 'Duplicate labels are not allowed!',
            isValid: (text) => !isDuplicate(text),
          }}
        />
      </span>
      <span className={styles.labelStatus}>
        {status === 1 ? 'active' : 'deactivated'}
      </span>
    </div>
  );
};

const MacAddress = ({ address, status }) => {
  return (
    <div>
      <span
        className={status === 1 ? styles.valueActive : styles.valueInactive}
      >
        {address}
      </span>
    </div>
  );
};

const HardwarePhones = () => {
  const { hardwarePhones: hardwarePhonesStore } = useStores();
  const history = useHistory();
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/hardware-phones',
  );
  const { hardwarePhoneId } = useParams();
  const isUpdating = useIsMutating(['updateHardwarePhone']);

  const tableColumns = [
    {
      id: 'label',
      numeric: false,
      disablePadding: false,
      label: 'Label',
      width: '50%',
    },
    {
      id: 'macAddress',
      numeric: false,
      disablePadding: false,
      label: 'MAC Address',
      width: '30%',
    },
    {
      id: 'action',
      numeric: false,
      disablePadding: false,
      label: 'Directory',
      width: '20%',
    },
  ];

  const {
    isFetching,
    isFetched,
    data: tableRows,
  } = useQuery(
    ['hardwarePhones'],
    () => hardwarePhonesStore.fetchHardwarePhones(),
    {
      initialData: [],
      select: (data) =>
        data.map(
          ({ fullname, phoneAccess, mac_address, id, hardware_config }) => {
            const label = (
              <Label id={id} name={fullname} status={phoneAccess} />
            );
            const macAddress = (
              <MacAddress
                address={mac_address.toUpperCase()}
                status={phoneAccess}
              />
            );
            let actions = null;
            if (hardware_config?.phone_model === PHONE_MODEL.T54W) {
              actions = (
                <IconButton onClick={() => history.push(`${match.url}/${id}`)}>
                  <Settings />
                </IconButton>
              );
            }

            return {
              id,
              label,
              macAddress,
              actions,
            };
          },
        ),
    },
  );

  return hardwarePhoneId ? (
    <Configuration id={hardwarePhoneId} />
  ) : (
    <div className={styles.root}>
      <div className={styles.header}>Hardware Phones</div>
      <div
        style={{
          position: 'relative',
          height: '100%',
          pointerEvents: isFetching ? 'none' : 'initial',
        }}
      >
        {Boolean(isFetching || isUpdating) && (
          <LinearProgress
            color="secondary"
            className={styles.tableProgressBar}
          />
        )}
        <Table
          columns={tableColumns}
          rows={tableRows}
          height="100%"
          isSelectable={false}
          isEmpty={isFetched && !tableRows.length}
        />
      </div>
    </div>
  );
};

export default HardwarePhones;

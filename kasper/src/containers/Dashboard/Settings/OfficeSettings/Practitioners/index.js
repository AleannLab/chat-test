import React, { useState } from 'react';
import Table from 'components/Core/Table';
import { observer } from 'mobx-react-lite';
import CheckIcon from '@material-ui/icons/Check';
import axios from 'axios';
import { LinearProgress } from '@material-ui/core';
import { useQuery, useQueryClient, useMutation } from 'react-query';

import Avatar from 'components/Avatar';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import EditPractitioner from './EditPractitioner';
import Menu from './Menu';
import styles from './index.module.css';

const Practitioners = observer(() => {
  const { practitioners, notification, utils } = useStores();
  const [openEditPractitioner, setOpenEditPractitioner] = useState(false);
  const validExtensions = ['jpg', 'jpeg', 'png'];
  const authToken = useAuthToken();
  const queryClient = useQueryClient();

  const tableColumns = [
    {
      id: 'name',
      numeric: false,
      disablePadding: false,
      label: 'Name',
      width: '40%',
    },
    {
      id: 'description',
      numeric: false,
      disablePadding: false,
      label: 'Description',
      width: '40%',
    },
    {
      id: 'action',
      numeric: false,
      disablePadding: false,
      label: 'Action',
      width: '20%',
      align: 'center',
    },
  ];

  const [tableRows, setTableRows] = useState(
    queryClient.getQueryData('fetchPractitioners')
      ? queryClient
          .getQueryData('fetchPractitioners')
          .map(
            ({
              id,
              f_name,
              l_name,
              suffix,
              bio,
              phone_no,
              is_default,
              display_image,
            }) => {
              return createTableData(
                id,
                f_name,
                l_name,
                suffix,
                bio,
                phone_no,
                is_default,
                display_image,
              );
            },
          )
      : [],
  );

  const [practitionerInfo, setPractitionerInfo] = useState({
    id: '',
    firstName: '',
    lastName: '',
    practitionerImg: '',
    phoneNo: '',
    readyForDocSms: false,
    description: '',
  });
  const [disableFields, setDisableFields] = useState(false);

  function createTableData(
    id,
    firstName,
    lastName,
    suffix,
    bio,
    phoneNo,
    isDefault,
    displayImage,
  ) {
    const practitionerImg = utils.prepareMediaUrl({
      uuid: displayImage,
      authToken,
    });
    const practitionerAvatar = (
      <Avatar
        src={practitionerImg}
        id={id}
        firstName={firstName}
        lastName={lastName}
        width={62}
        height={62}
        letterFontSize="1.25rem"
        className={styles.avatar}
      />
    );

    const nameAvatar = (
      <div className={styles.avatarName}>
        {practitionerAvatar}
        <div className={styles.info}>
          <span className={styles.name}>
            <>
              {firstName} {lastName}
              {suffix ? `, ${suffix}` : ``}
            </>
          </span>
          {phoneNo ? <span className={styles.phoneNo}>{phoneNo}</span> : null}
          {isDefault ? (
            <span className={styles.default}>
              <CheckIcon
                fontSize="small"
                style={{ color: '#1ABA17', marginRight: '2px' }}
              />
              Default
            </span>
          ) : null}
        </div>
      </div>
    );

    const description = <span className={styles.description}>{bio}</span>;

    const action = (
      <Menu
        handleEditPractitioner={(id) => handleEditPractitioner(id)}
        id={id}
        handleSetDefault={(id) => handleSetDefault(id, !isDefault)}
      />
    );

    return { id, nameAvatar, description, action };
  }

  const { isFetched, isFetching } = useQuery(
    'fetchPractitioners',
    () => practitioners.fetchPractitioners(),
    {
      onSuccess: (data) => {
        setTableRows(
          data.map(
            ({
              id,
              f_name,
              l_name,
              suffix,
              bio,
              phone_no,
              is_default,
              display_image,
            }) => {
              return createTableData(
                id,
                f_name,
                l_name,
                suffix,
                bio,
                phone_no,
                is_default,
                display_image,
              );
            },
          ),
        );
      },
    },
  );

  const setDefaultPractitionerQuery = useMutation(
    'setDefaultPractitioner',
    (data) => practitioners.setDefaultPractitioner(data),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => {
        queryClient.refetchQueries('fetchPractitioners');
      },
    },
  );

  const editPractitionerQuery = useMutation(
    'editPractitioner',
    (data) => practitioners.editPractitioner(data),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => {
        queryClient.refetchQueries('fetchPractitioners');
        setOpenEditPractitioner(false);
      },
    },
  );

  const handleSetDefault = async (id, is_default) => {
    await setDefaultPractitionerQuery.mutateAsync({ id, is_default });
  };

  const handleEditPractitioner = (id) => {
    let currentPractitioner = {};
    queryClient.getQueryData('fetchPractitioners').forEach((practitioner) => {
      if (practitioner.id === id) {
        const practitionerImg = utils.prepareMediaUrl({
          uuid: practitioner.display_image,
          authToken,
        });
        currentPractitioner.id = practitioner.id;
        currentPractitioner.firstName = practitioner.f_name;
        currentPractitioner.lastName = practitioner.l_name;
        currentPractitioner.practitionerImg = practitionerImg;
        currentPractitioner.phoneNo = practitioner.phone_no;
        currentPractitioner.readyForDocSms = practitioner.readyForDocSms;
        currentPractitioner.description = practitioner.bio;
      }
    });
    setPractitionerInfo(currentPractitioner);
    setOpenEditPractitioner(true);
  };

  const editInformation = async (data) => {
    await editPractitionerQuery.mutateAsync(data);
  };

  const handleAvatarChange = async (e, id) => {
    setDisableFields(true);
    const currentFileExtension = e.target.files[0].name
      .split('.')
      [e.target.files[0].name.split('.').length - 1].toLowerCase();
    let valid = validExtensions.includes(currentFileExtension);
    if (valid) {
      notification.showInfo('Please wait while the image is being uploaded');
      await handleSave(e.target.files[0], id);
    } else {
      notification.showError('Please upload a valid image file');
    }
  };

  const handleSave = async (file, id) => {
    try {
      const response = await practitioners.uploadAvatar({ file, id });
      if (response.url) {
        axios({
          method: 'PUT',
          url: response.url,
          headers: {
            'content-type': file.type,
          },
          processData: false,
          data: file,
        })
          .then(async () => {
            await practitioners.updateAvatar({
              id,
              display_image: response.uuid,
            });
            notification.showSuccess('Avatar was updated successfully');
            await queryClient.refetchQueries('fetchPractitioners');
            const practitionerImg = utils.prepareMediaUrl({
              uuid: response.uuid,
              authToken,
            });
            const practitionerCopy = { ...practitionerInfo };
            practitionerCopy.practitionerImg = practitionerImg;
            setPractitionerInfo(practitionerCopy);
            setDisableFields(false);
            setTimeout(() => {
              notification.hideNotification();
            }, 2500);
          })
          .catch((e) => {
            notification.showError(
              'An unexpected error occurred while attempting to upload the image',
            );
          });
      }
    } catch (e) {
      throw Error(
        'An unexpected error occurred while attempting to upload the image',
      );
    }
  };

  const handleAvatarDelete = async (id) => {
    try {
      setDisableFields(true);
      notification.showInfo('Please wait while the image is being deleted');
      await practitioners.updateAvatar({ id, display_image: '' });
      await queryClient.refetchQueries('fetchPractitioners');
      const practitionerCopy = { ...practitionerInfo };
      practitionerCopy.practitionerImg = '';
      setPractitionerInfo(practitionerCopy);
      notification.hideNotification();
      setDisableFields(false);
    } catch (err) {
      notification.showError(
        'An unexpected error occurred while attempting to delete the avatar',
      );
      setDisableFields(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.header}>Practitioners</div>
        <div style={{ height: '5px' }}>
          {isFetching && <LinearProgress className="mb-0" />}
        </div>
        <Table
          columns={tableColumns}
          rows={tableRows}
          sortBy={tableColumns[0].id}
          allowSelectAll={false}
          isSelectable={false}
          isEmpty={isFetched && tableRows.length}
        />
        {openEditPractitioner && (
          <EditPractitioner
            id={practitionerInfo.id}
            firstName={practitionerInfo.firstName}
            lastName={practitionerInfo.lastName}
            practitionerImg={practitionerInfo.practitionerImg}
            phoneNo={practitionerInfo.phoneNo}
            readyForDocSms={practitionerInfo.readyForDocSms}
            description={practitionerInfo.description}
            editInformation={editInformation}
            handleAvatarChange={handleAvatarChange}
            handleAvatarDelete={handleAvatarDelete}
            disableFields={disableFields}
            onClose={() => setOpenEditPractitioner(false)}
          />
        )}
      </div>
    </div>
  );
});

export default Practitioners;

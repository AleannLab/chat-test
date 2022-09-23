import React, { useState, useRef } from 'react';
import { Box, Typography, Button } from '@material-ui/core';
import Avatar from 'components/Avatar';
import { ReactComponent as CallIcon } from 'assets/images/call.svg';
import { ReactComponent as CopyIcon } from 'assets/images/copy.svg';
import { ReactComponent as MessageIcon } from 'assets/images/message.svg';
import { ReactComponent as ContactIcon } from 'assets/images/contact.svg';
import { ReactComponent as UserFilesIcon } from 'assets/images/user-files.svg';

import moment from 'moment';
import PhoneNumber from 'awesome-phonenumber';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { checkSignificantLength, normalizeNumber } from 'helpers/misc';
import { PATIENT_DATA_MODAL_TABS } from 'helpers/constants';
import TabHeader from './TabHeader';
import Appointments from './Appointments';
import PatientData from '../PatientData';

const Profile = ({ patient, renderHeader }) => {
  const { notification, dialer, patientData } = useStores();
  const [showPatientData, setShowPatientData] = useState(false);
  const formDataTabRef = useRef();
  const handleCopy = (type, value) => {
    navigator.clipboard.writeText(value);
    notification.showSuccess(
      `${type.charAt(0).toUpperCase() + type.slice(1)} was copied succesfully`,
    );
    setTimeout(() => {
      notification.hideNotification();
    }, 2500);
  };

  const handlePhoneClick = (phoneNumber) => {
    const phone = new PhoneNumber(normalizeNumber(phoneNumber), 'US');
    dialer.startCall(
      phone
        ? checkSignificantLength(phone, phoneNumber)
        : normalizeNumber(phoneNumber),
    );
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <TabHeader title="Patient Profile" />
      <Box display="flex" marginY={1.5}>
        <Avatar
          id={patient.id}
          firstName={patient.firstname || patient.firstName}
          lastName={patient.lastname || patient.lastName}
          customLetter="00"
          width={58}
          height={58}
          letterFontSize={16}
        ></Avatar>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          marginX={1}
        >
          <Typography style={{ fontWeight: '500', fontSize: '16px' }}>
            {patient.displayName}
          </Typography>
          <Typography variant="caption">
            {patient.dob
              ? `${moment.utc(patient.dob).format('MM/DD/YYYY')} (${moment()
                  .utc()
                  .diff(patient.dob, 'years')})`
              : 'N/A'}
          </Typography>
        </Box>
      </Box>

      <Box marginY={1.5}>
        <Box
          display="flex"
          paddingX={1.5}
          paddingY={0.8}
          alignItems="center"
          borderRadius="3px 3px 0px 0px"
          border={1}
          borderColor={'#D9E2F3'}
        >
          <CallIcon
            style={{ marginRight: '0.5rem', cursor: 'pointer' }}
            onClick={() => handlePhoneClick(patient.phone_no)}
          />
          <Typography>
            {PhoneNumber(patient.phone_no || '').getNumber('national') ?? 'N/A'}
          </Typography>
          <CopyIcon
            onClick={() =>
              handleCopy(
                'phone number',
                PhoneNumber(patient.phone_no).getNumber('national'),
              )
            }
            style={{ marginLeft: 'auto', cursor: 'pointer' }}
          />
        </Box>
        <Box
          display="flex"
          paddingX={1.5}
          paddingY={0.8}
          alignItems="center"
          border={1}
          borderRadius="0px 0px 3px 3px"
          borderTop={0}
          borderColor={'#D9E2F3'}
        >
          <MessageIcon
            style={{
              marginRight: '0.5rem',
              minWidth: 'fit-content',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              window.location = `mailto:${patient.email}`;
              e.preventDefault();
            }}
          />
          <Typography
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {patient.email ?? 'N/A'}
          </Typography>
          <CopyIcon
            onClick={() => {
              if (!patient.email) return;
              handleCopy('Email', patient.email);
            }}
            style={{
              marginLeft: 'auto',
              cursor: patient.email ? 'pointer' : 'auto',
              minWidth: 'fit-content',
            }}
          />
        </Box>
      </Box>

      <Box marginY={1.5}>
        <Typography
          style={{
            fontFamily: 'Montserrat',
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '11px',
            color: '#999999',
            textTransform: 'uppercase',
          }}
        >
          Preferred Provider
        </Typography>
        <Typography variant="body">
          {patient.preffered_provider || 'N/A'}
        </Typography>
      </Box>

      <Box marginY={1.5} display="flex">
        <Button
          className="primary-btn me-2"
          variant="outlined"
          color="primary"
          style={{ width: '50%', height: '30px' }}
          startIcon={<ContactIcon />}
          onClick={() => {
            patientData.setSelectedPatient(
              patient.id,
              patient.firstname || patient.firstName,
              patient.lastname || patient.lastName,
            );
            formDataTabRef.current = PATIENT_DATA_MODAL_TABS.patientInfo;
            setShowPatientData(true);
          }}
        >
          <span
            style={{
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Patient Info
          </span>
        </Button>
        <Button
          className="primary-btn me-2"
          variant="outlined"
          color="primary"
          style={{ width: '50%', height: '30px' }}
          startIcon={<UserFilesIcon />}
          onClick={() => {
            patientData.setSelectedPatient(
              patient.id,
              patient.firstname || patient.firstName,
              patient.lastname || patient.lastName,
            );
            formDataTabRef.current = PATIENT_DATA_MODAL_TABS.fileDirectory;
            setShowPatientData(true);
          }}
        >
          Files
        </Button>
      </Box>

      <Box marginY={1.5} flexGrow={1} overflow="hidden">
        <Typography variant="h4" color="textPrimary">
          Appointments
        </Typography>
        <Box marginY={1} height="calc(100% - 30px)" overflow="auto">
          <Appointments />
        </Box>
      </Box>
      {showPatientData && (
        <PatientData
          onClose={() => setShowPatientData(false)}
          selectedTab={formDataTabRef.current}
        />
      )}
    </Box>
  );
};

export default observer(Profile);

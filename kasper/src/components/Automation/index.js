import React, { useState, useEffect } from 'react';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import { Typography, Container } from '@material-ui/core';
import styles from './index.module.css';
import PatientForm from './PatientForm';
import ActionsMenu from './ActionsMenu';
import { useStores } from 'hooks/useStores';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import Skeleton from '@material-ui/lab/Skeleton';
import Switch from 'components/Core/Switch';

const PATIENT_TYPE = {
  firstType: 'NEW',
  secondType: 'RETURNING',
};

const automationDataWrapper = [
  {
    id: 0,
    title: 'New patients (add new pt. forms to queue)',
    updateTitle: 'New patient creation (send forms to queue)',
    subTitle: [
      'Patient will not receive a link to fill out forms until appointment',
      'is created or upon reminder.',
    ],
    type: PATIENT_TYPE.firstType,
    formSubtitle: 'FORM(S)',
    formMiniTitle: 'New patient forms',
  },
  {
    id: 1,
    title: 'Returning patients (request form updates)',
    subTitle: [],
    type: PATIENT_TYPE.secondType,
    formSubtitle: 'FORM(S), EVERY',
    formMiniTitle: 'Returning patient medical updates',
  },
];

const Automation = ({ onClose }) => {
  const [addNewPatient, setAddNewPatient] = useState(false);
  const { paperlessAutomation, notification } = useStores();
  const [newPatientFormData, setNewPatientFormData] = useState({});
  const [returningPatientFormData, SetRetuningPatientFormData] = useState({});
  const { automationFormData } = paperlessAutomation;
  const [isEditPatientForm, setIsEditPatientForm] = useState(false);
  const queryClient = useQueryClient();
  const [selectedPatientType, setSelectedPatientType] = useState('');
  const [skeletonShow, setSkeletonShow] = useState(false);
  //will work later
  // const tableRows = [];
  // const tableCols = [
  //   {
  //     id: 'codes',
  //     align: 'center',
  //     numeric: false,
  //     disablePadding: false,
  //     label: 'Code(s)',
  //   },
  //   {
  //     id: '#OfForms',
  //     align: 'center',
  //     disablePadding: false,
  //     label: '# of forms',
  //   },
  //   {
  //     id: 'enabled',
  //     align: 'center',
  //     disablePadding: false,
  //     label: 'Enabled',
  //   },
  //   { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
  // ];

  const { isLoading, isFetching } = useQuery(['automationFetchData'], () => {
    return paperlessAutomation.fetchFormAutomationData();
  });
  const handleClose = () => {
    onClose();
  };

  const refetchAutomationQueryData = async (type) => {
    if (type === 'patientForm') setSkeletonShow(true);
    await queryClient.invalidateQueries('automationFetchData');
    setSkeletonShow(false);
  };

  useEffect(() => {
    if (automationFormData && automationFormData.length > 0) {
      const newPatientData = automationFormData.find(
        (filterItem) => filterItem.patient_type === PATIENT_TYPE.firstType,
      );
      if (newPatientData !== undefined) {
        setNewPatientFormData(newPatientData);
      } else {
        setNewPatientFormData({});
      }

      const returningPatientData = automationFormData.find(
        (filterItem) => filterItem.patient_type === PATIENT_TYPE.secondType,
      );
      if (returningPatientData !== undefined) {
        SetRetuningPatientFormData(returningPatientData);
      } else {
        SetRetuningPatientFormData({});
      }
    }
  }, [automationFormData]);

  const prepareActionList = () => {
    return [
      { label: 'Edit', value: 1 },
      // { label: 'Delete', value: 2 },
    ];
  };

  const setupFormAutomation = (type) => {
    setSelectedPatientType(type);
    setAddNewPatient(true);
  };

  const {
    mutate: automationSettingUpdate,
    isLoading: isAutomationSettingUpdating,
  } = useMutation(
    (updateAutomationSettingData) => {
      const updateAutomationSettingPayload = {
        id: updateAutomationSettingData.id,
        automation_setting: updateAutomationSettingData.automation_setting,
      };
      return paperlessAutomation.updateAutomationSetting(
        updateAutomationSettingPayload,
      );
    },
    {
      onSuccess: () => {
        refetchAutomationQueryData();
      },
      onError: (error) => {
        notification.showError(
          error.DetailedMessage ||
            'An unexpected error occurred while update the Automation',
        );
      },
    },
  );

  return (
    <>
      <Modal
        header="Automations"
        size="md"
        body={
          <Container className="d-flex flex-column justify-content-center">
            <Typography className={styles.subTitleText}>
              Set up auto-sending forms to patients
            </Typography>
            {automationDataWrapper &&
              automationDataWrapper.map((automationItem, index) => {
                let patientFormData =
                  automationItem.type === PATIENT_TYPE.firstType
                    ? newPatientFormData
                    : returningPatientFormData;
                return (
                  <div
                    className="d-flex justify-content-between mt-5"
                    key={automationItem.id}
                  >
                    <div className="w-100">
                      <Typography className={styles.patientTitle}>
                        {index !== 0
                          ? automationItem.title
                          : patientFormData &&
                            Object.keys(patientFormData).length > 0
                          ? automationItem.updateTitle
                          : automationItem.title}
                      </Typography>
                      <Typography className={styles.patientSubtitle}>
                        {automationItem.subTitle.map((subtitleItem, index) => (
                          <>
                            {index !== 0 && <br />} {subtitleItem}
                          </>
                        ))}
                      </Typography>
                    </div>

                    <div className="w-50 d-flex justify-content-end align-items-center">
                      {isLoading || (isFetching && skeletonShow) ? (
                        <Skeleton variant="rect" width={250} height={40} />
                      ) : patientFormData &&
                        Object.keys(patientFormData).length > 0 ? (
                        <div className="d-flex justify-content-between  align-items-center">
                          <div
                            className={`d-flex align-items-center justify-content-center flex-column ${styles.minWidth_200}`}
                          >
                            <span className={styles.FormCount}>
                              {JSON.parse(patientFormData.forms).length}
                            </span>
                            <small className={styles.FormCountLabel}>
                              {`FORM(S)${
                                patientFormData.patient_type ===
                                PATIENT_TYPE.secondType
                                  ? `, EVERY ${patientFormData.form_expiration_period} MONTHS`
                                  : ''
                              }`}
                            </small>
                          </div>
                          <div className={styles.automationSettingToggle}>
                            <Switch
                              disabled={
                                isAutomationSettingUpdating ||
                                isLoading ||
                                isFetching
                              }
                              checked={patientFormData.automation_setting}
                              className={styles.switch}
                              name="automation_setting"
                              onChange={() =>
                                automationSettingUpdate({
                                  id: patientFormData.id,
                                  automation_setting:
                                    !patientFormData.automation_setting,
                                })
                              }
                            />
                          </div>
                          <div>
                            <ActionsMenu
                              handleOpen={() => {
                                setIsEditPatientForm(true);
                                setupFormAutomation(automationItem.type);
                              }}
                              menuItems={prepareActionList()}
                              type={automationItem.type}
                              PATIENT_TYPE={PATIENT_TYPE}
                            />
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() =>
                            setupFormAutomation(automationItem.type)
                          }
                        >
                          Set Up
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
          </Container>
        }
        footer={<></>}
        onClose={handleClose}
      />
      {addNewPatient === true && (
        <PatientForm
          onClose={() => {
            setAddNewPatient(false);
            setSelectedPatientType('');
            setIsEditPatientForm(false);
          }}
          isEditPatientForm={isEditPatientForm}
          patientFormData={
            selectedPatientType === PATIENT_TYPE.firstType
              ? newPatientFormData
              : returningPatientFormData
          }
          refetchAutomationQueryData={refetchAutomationQueryData}
          selectedPatientType={selectedPatientType}
          PATIENT_TYPE={PATIENT_TYPE}
        />
      )}
    </>
  );
};

export default Automation;
export { automationDataWrapper, PATIENT_TYPE };

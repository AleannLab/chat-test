import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import Button from '@material-ui/core/Button';
import Avatar from 'components/Avatar';
import SearchIcon from '@material-ui/icons/Search';

import { observer } from 'mobx-react';
import { makeStyles } from '@material-ui/core/styles';
import * as mobx from 'mobx';
import { Form, Formik } from 'formik';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

import UploadFile from './UploadFile';
import { ReactComponent as DownloadIcon } from 'assets/images/download.svg';
import { ReactComponent as PrintIcon } from 'assets/images/print.svg';
import FileDirectory from './FileDirectory';
import styles from './index.module.css';
import FormData from './FormData';
import { useStores } from 'hooks/useStores';
import { useOnClickOutside } from 'hooks/useOnClickOutside';
import Modal from 'components/Core/Modal';
import CustomTooltip from 'components/Core/Tooltip';
import { ReactComponent as CloudUpload } from 'assets/images/cloud-upload-white.svg';
import { PATIENT_DATA_MODAL_TABS } from 'helpers/constants';

const useStyles = makeStyles(() => ({
  avatarName: {
    display: 'flex',
    alignSelf: 'flex-end',
    marginRight: '5rem',
    gap: '2rem',
  },
  avatarInitials: {
    fontSize: '0.85rem',
  },
  name: {
    paddingLeft: '0.57rem',
    color: '#0D2145',
    fontWeight: 'bold',
    fontSize: '1.42rem',
    fontFamily: 'Playfair Display, serif',
  },
  arrow: {
    display: 'flex',
    alignSelf: 'center',
    marginBottom: '7px',
    cursor: 'pointer',
  },
  autoCompleteField: {
    minWidth: '250px',
  },
}));

const PatientData = ({ onClose, selectedTab }) => {
  const { patients, patientData, notification } = useStores();
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  const [firstName, setFirstName] = useState(
    patientData.selectedPatient.firstName,
  );
  const [lastName, setLastName] = useState(
    patientData.selectedPatient.lastName,
  );
  const [open, setOpen] = useState(false);
  const [patientDataType, setPatientDataType] = useState(
    selectedTab || PATIENT_DATA_MODAL_TABS.fileDirectory,
  );
  const [searchText, setSearchText] = useState('');

  const searchIconRef = useRef(null);
  const autoCompleteRef = useRef(null);
  const prevOpen = useRef(open);

  useEffect(() => {
    patientData.toggleSelectAll(false);
  }, []);

  useEffect(() => {
    patientData.allFormsData.clear();
    patientData.fetchPatientForms().catch((e) => {
      console.error(e);
      notification.showError(e.message);
    });

    if (prevOpen.current === true && open === false) {
      searchIconRef.current.focus();
    }
    prevOpen.current = open;
  }, [patientData.selectedPatient]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && autoCompleteRef.current) {
      autoCompleteRef.current.querySelector('input').focus();
    }
  }, [open, autoCompleteRef]);

  // List of patients provided to to patient form field filtered as per given search text
  const filteredPatients = useMemo(() => {
    setIsLoadingPatients(false);
    return Object.values(patients.datum).map((patient) => {
      return { ...patient, name: `${patient.firstname} ${patient.lastname}` };
    });
  }, [patients.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleItemClick = (id, firstName, lastName) => {
    setFirstName(firstName);
    setLastName(lastName);
    patientData.setSelectedPatient(id, firstName, lastName);
    setOpen(false);
  };

  const handleDataTypeSwitch = (patientDataType) => {
    setPatientDataType(patientDataType);
  };

  const handleClose = () => {
    onClose();
  };

  const classes = useStyles();

  const onClickOutsideHandler = useCallback((event) => {
    if (!event.target.classList.contains('MuiAutocomplete-option')) {
      setOpen(false);
    }
  }, []);

  useOnClickOutside(autoCompleteRef, onClickOutsideHandler);

  return (
    <>
      <Modal
        size="lg"
        enableMargin={false}
        header="Patient Data"
        body={
          <div className={styles.container}>
            <div className={classes.avatarName}>
              {!open ? (
                <>
                  <div className={styles.patientWrapper}>
                    <Avatar
                      id={parseInt(patientData.selectedPatient.id)}
                      firstName={firstName}
                      lastName={lastName}
                      width="32px"
                      height="32px"
                    />
                    <p className={classes.name}>
                      {firstName} {lastName}
                    </p>
                  </div>
                  <SearchIcon
                    className={classes.arrow}
                    ref={searchIconRef}
                    onClick={() => handleToggle()}
                  />
                </>
              ) : (
                <Formik initialValues={{}}>
                  <Form className={classes.autoCompleteField}>
                    <AutoCompleteInputField
                      mt={0}
                      fieldName="patient"
                      fieldLabel=""
                      autoCompleteRef={autoCompleteRef}
                      placeholder="Type to search patient"
                      getOptionLabel={(item) => item.name}
                      onChangeInput={(query) => {
                        setIsLoadingPatients(true);
                        patients.fetchList({
                          search: query,
                          rows: 10,
                        });
                      }}
                      onSelectionChange={(selection) => {
                        handleItemClick(
                          selection.id,
                          selection.firstname,
                          selection.lastname,
                        );
                      }}
                      suggestions={filteredPatients}
                      loading={isLoadingPatients}
                    />
                  </Form>
                </Formik>
              )}
            </div>
            <Grid container direction="row" className={styles.typeSwitcher}>
              <Grid item xs={2}>
                <p
                  className={
                    patientDataType === PATIENT_DATA_MODAL_TABS.fileDirectory
                      ? styles.selectedType
                      : styles.unselectedType
                  }
                  onClick={() =>
                    handleDataTypeSwitch(PATIENT_DATA_MODAL_TABS.fileDirectory)
                  }
                >
                  File Directory
                </p>
              </Grid>
              <Grid item xs={10} className={styles.formDataContainer}>
                <p
                  className={
                    patientDataType === PATIENT_DATA_MODAL_TABS.patientInfo
                      ? styles.selectedFormData
                      : styles.unselectedFormData
                  }
                  onClick={() =>
                    handleDataTypeSwitch(PATIENT_DATA_MODAL_TABS.patientInfo)
                  }
                >
                  <span>Patient Info</span>
                </p>
                <div
                  className={
                    patientDataType === PATIENT_DATA_MODAL_TABS.patientInfo
                      ? styles.showFormActions
                      : styles.hideFormActions
                  }
                >
                  {patientData.selectAll && patientData.isIncompleteSelected ? (
                    <Button
                      size="medium"
                      variant="outlined"
                      color="secondary"
                      className="me-2"
                      disabled={patientData.emptyFormData}
                      onClick={() => patientData.toggleSelectAll(true)}
                    >
                      Select All
                    </Button>
                  ) : !patientData.isIncompleteSelected &&
                    patientData.selectAll ? (
                    <Button
                      size="medium"
                      variant="outlined"
                      color="primary"
                      className="me-2"
                      disabled={patientData.emptyFormData}
                      onClick={() => patientData.toggleSelectAll(false)}
                    >
                      Unselect
                    </Button>
                  ) : !patientData.selectAll &&
                    patientData.isIncompleteSelected ? (
                    <Button
                      size="medium"
                      variant="outlined"
                      color="secondary"
                      className="me-2"
                      disabled={patientData.emptyFormData}
                      onClick={() => {
                        patientData.toggleSelectAll(true);
                        patientData.toggleIsIncompleteSelected(false);
                      }}
                    >
                      Select All
                    </Button>
                  ) : (
                    <Button
                      size="medium"
                      variant="outlined"
                      color="secondary"
                      className="me-2"
                      disabled={patientData.emptyFormData}
                      onClick={() => patientData.toggleSelectAll(true)}
                    >
                      Select All
                    </Button>
                  )}
                  <CustomTooltip title="Download selected forms" color="#000">
                    <IconButton
                      aria-label="download-section"
                      onClick={() => patientData.setIsPrintingSection(true)}
                      disabled={patientData.emptyFormData}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </CustomTooltip>

                  <CustomTooltip title="Print all the forms" color="#000">
                    <IconButton
                      aria-label="download-form"
                      onClick={() =>
                        patientData.setIsPrintingCompleteForm(true)
                      }
                      disabled={patientData.emptyFormData}
                    >
                      <PrintIcon />
                    </IconButton>
                  </CustomTooltip>
                </div>
              </Grid>
            </Grid>
            {patientDataType === PATIENT_DATA_MODAL_TABS.fileDirectory ? (
              <div className={styles.contentContainer}>
                <FileDirectory fName={firstName} lName={lastName} />
              </div>
            ) : (
              <div className="d-flex flex-column justify-content-center mx-5">
                <FormData />
              </div>
            )}
          </div>
        }
        footer={
          patientDataType === PATIENT_DATA_MODAL_TABS.fileDirectory ? (
            <div className={styles.footer}>
              <Button
                className="secondary-btn me-auto"
                variant="contained"
                style={{ width: '176px' }}
                color="secondary"
                startIcon={<CloudUpload />}
                onClick={() => setShowUploadFile(true)}
              >
                Upload File
              </Button>
              <Button
                className="primary-btn"
                variant="outlined"
                color="primary"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          ) : (
            <Button
              style={{ marginRight: '5rem', marginBottom: '3rem' }}
              className="primary-btn"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Close
            </Button>
          )
        }
        onClose={handleClose}
      />
      {showUploadFile === true && (
        <UploadFile onClose={() => setShowUploadFile(false)} />
      )}
    </>
  );
};

export default observer(PatientData);

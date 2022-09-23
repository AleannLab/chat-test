import {
  ButtonBase,
  Chip,
  CircularProgress,
  IconButton,
  makeStyles,
  TextField,
  Tooltip,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ReactComponent as ContactIcon } from 'assets/images/contact-2.svg';
import PhoneNumber from 'awesome-phonenumber';
import Checkbox from 'components/Core/Checkbox';
import FileUpload from 'components/Core/FileUpload';
import TextInputField from 'components/Core/Formik/TextInputField';
import Modal from 'components/Core/Modal';
import FaxContactList from 'components/FaxContactList';
import { Form, Formik } from 'formik';
import { useAuthToken } from 'hooks/useAuthToken';
import { useStores } from 'hooks/useStores';
import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import * as Yup from 'yup';
import 'yup-phone';
import FaxSuccess from './FaxSuccess';
import styles from './index.module.css';
import AddCoverLetter from './AddCoverLetter';
import { ReactComponent as MailIcon } from 'assets/images/mail.svg';
import { useFlags } from 'launchdarkly-react-client-sdk';
import PhoneInputField from 'components/Core/Formik/PhoneInputField';

const VALID_FORMATS = [
  '.pdf',
  '.txt',
  '.jpg',
  '.jpeg',
  '.png',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
];

const SendFax = () => {
  const history = useHistory();
  const [showFaxSuccess, setShowFaxSuccess] = useState(false);
  const [isSendingFax, setIsSendingFax] = useState(false);
  const [showSendFax, setShowSendFax] = useState(true);
  const [openContacts, setOpenContacts] = useState(false);
  const [showAddCoverLetter, setShowAdCoverLetter] = useState(false);

  const [recipients, setRecipients] = useState([]);
  const [files, setFiles] = useState([]);
  const [coverLetter, setCoverLetter] = useState(null);
  const { fax, utils, notification, contacts, activityLogs } = useStores();
  const authToken = useAuthToken();
  const queryClient = useQueryClient();
  const { faxCoverLetter = true } = useFlags();
  const coverLetterEmpty = !coverLetter;

  const validationSchema = Yup.object({
    firstName: Yup.string().trim().nullable(),
    lastName: Yup.string().trim().nullable(),
    companyName: Yup.string().trim().nullable(),
    faxNumber: Yup.string()
      .trim()
      .nullable()
      .required('Fax number is required')
      .phone('US', false, 'Invalid fax number'),
  });

  const initialValues = {
    firstName: '',
    lastName: '',
    companyName: '',
    faxNumber: '',
    saveContact: false,
    selectedRecipients: recipients,
  };

  const handleClose = () => {
    history.goBack();
  };

  const constructName = (e) => {
    const pn = new PhoneNumber(e.faxNumber, 'US');
    let did = pn.getNumber('e164');
    let name = [did];
    if (e.firstname && e.firstname.trim().length) {
      name.push(e.firstname);
    }
    if (e.lastname && e.lastname.trim().length) {
      name.push(e.lastname);
    }
    return name.join(' | ');
  };

  const { data: faxNumbers = [], isLoading: loadingFaxNumbers } = useQuery(
    ['faxNumbers'],
    () => fax.getFaxNumbers(),
    {
      onSuccess: (data) => {
        if (data) setSelectedFaxNumber(data[0]);
      },
    },
  );

  const [selectedFaxNumber, setSelectedFaxNumber] = useState(
    faxNumbers[0] ?? null,
  );

  const { data: suggestions, isLoading: loadingRecipients } = useQuery(
    'faxRecipients',
    () => contacts.fetchList(),
    {
      select: (data) => {
        return data.map((contact) => {
          const contactData = contacts.get([{}, contact]);
          return {
            id: contactData.uuid,
            firstname: contactData.firstname,
            lastname: contactData.lastname,
            company: contactData.company,
            faxNumber: contactData.faxNumber,
            name: constructName(contactData),
          };
        });
      },
    },
  );

  const handleRecipientAddButton = (e) => {
    const pn = new PhoneNumber(e.faxNumber, 'US');
    let did = pn.getNumber('e164');

    // Prevent duplicates
    if (recipients.some((x) => x.did === did)) {
      return;
    }

    const maxId = Math.max(...recipients.map((x) => x.id), 0);

    let name = pn.getNumber('national');
    if (e.companyName.trim().length) {
      name += ' | ' + e.companyName.trim();
    }

    if (e.firstName.trim().length || e.lastName.trim().length) {
      name += ' | ' + (e.firstName.trim() + ' ' + e.lastName.trim()).trim();
    }

    const newRecipient = {
      id: maxId + 1,
      name: name,
      did: did,
    };

    setRecipients([...recipients, newRecipient]);
    if (e.saveContact) {
      saveContactHandler(e);
    }
  };

  const handleRecipientAdd = (selectedRecipients) => {
    if (selectedRecipients) {
      let recipientToAdd = [];
      for (let e of selectedRecipients) {
        let name = constructName(e);
        const pn = new PhoneNumber(e.faxNumber, 'US');
        let did = pn.getNumber('e164');
        // Prevent duplicates
        if (!recipients.some((x) => x.did === did)) {
          recipientToAdd.push({ id: e.id, name, did });
        }
      }
      if (recipientToAdd?.length > 0) {
        setRecipients([...recipients, ...recipientToAdd]);
      }
    }
  };

  // This function is used to save contact
  const saveContactHandler = async (e) => {
    await contacts.create({
      firstname: e.firstName,
      lastname: e.lastName,
      company: e.companyName,
      faxNumber: e.faxNumber,
    });
  };

  const handleRecipientDelete = (i) => {
    const tags = [...recipients];
    tags.splice(
      recipients.findIndex((r) => r.id === i.id),
      1,
    );
    setRecipients(tags);
  };

  const handleSend = () => {
    setIsSendingFax(true);
    fax
      .sendFax(
        selectedFaxNumber.number,
        recipients.map(({ did }) => did).join(),
        selectedFaxNumber.provider,
        files,
        coverLetter,
        authToken,
        utils,
      )
      .then(() => {
        queryClient
          .invalidateQueries(activityLogs.queryKeys.faxLogs)
          .then(() => {
            notification.hideNotification();
            setShowSendFax(false);
            setShowFaxSuccess(true);
            const [queryKeys, prevData] =
              queryClient.getQueriesData([
                activityLogs.queryKeys.faxLogs,
              ])?.[0] ?? [];
            activityLogs.setSelectedActivity(prevData?.pages[0][0]);
          });
      })
      .catch((err) => {
        console.error(err);
        notification.showError(err.message);
        setTimeout(() => {
          notification.hideNotification();
          setShowSendFax(false);
          history.goBack();
        }, 3500);
      });
  };

  const coverLetterSection = (
    <div
      style={{
        backgroundColor: coverLetterEmpty ? '#F3F5F9' : '#fff',
        opacity: isSendingFax ? 0.5 : 1,
      }}
      className={styles.coverLetterContainer}
    >
      <div className="d-flex align-items-center">
        <MailIcon
          fill={coverLetterEmpty ? '#999999' : '#F4266E'}
          height={18}
          width={18}
        />
        <span
          style={{
            color: coverLetterEmpty ? '#999999' : '#02122F',
          }}
          className={styles.coverLetterLabel}
        >
          {coverLetterEmpty
            ? 'Cover Letter not included'
            : 'Cover Letter included'}
        </span>
      </div>
      {coverLetterEmpty ? (
        <ButtonBase
          onClick={() => setShowAdCoverLetter(true)}
          className={styles.addCoverLetterButton}
          color="secondary"
        >
          Add
        </ButtonBase>
      ) : (
        <div className="d-flex">
          <ButtonBase
            disabled={isSendingFax}
            onClick={() => setShowAdCoverLetter(true)}
            className={styles.addCoverLetterButton}
            color="secondary"
          >
            Edit
          </ButtonBase>
          <ButtonBase
            disabled={isSendingFax}
            onClick={() => setCoverLetter(null)}
            className={styles.addCoverLetterButton}
            color="secondary"
          >
            Delete
          </ButtonBase>
        </div>
      )}
    </div>
  );

  return (
    <>
      {showSendFax === true && (
        <Modal
          allowClosing={!isSendingFax}
          size="sm"
          header="Send a Fax"
          body={
            <div className={styles.addRecipientContainer}>
              <Formik
                validateOnBlur={false}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                  handleRecipientAddButton(values);
                  resetForm({ values: initialValues });
                }}
              >
                {({ errors, isSubmitting, setFieldValue, values }) => (
                  <Form>
                    <div className={`${styles.recipientListLabel} mb-2 mt-3`}>
                      Send from fax number
                    </div>
                    <Autocomplete
                      style={
                        isSubmitting || isSendingFax
                          ? { pointerEvents: 'none', cursor: 'no-drop' }
                          : {}
                      }
                      id="tags-input-field"
                      options={faxNumbers || []}
                      freeSolo={false}
                      filterSelectedOptions
                      value={selectedFaxNumber}
                      loading={loadingFaxNumbers}
                      disabled={loadingFaxNumbers || isSendingFax}
                      renderOption={(option) => (
                        <span className="text-truncate">{`${option.number}`}</span>
                      )}
                      getOptionLabel={(option) => `${option.number}`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label=""
                          placeholder={
                            loadingFaxNumbers
                              ? 'Loading...'
                              : 'Start typing to select Fax Number'
                          }
                          size="small"
                        />
                      )}
                      onChange={(event, newInputValue, reason, details) => {
                        setSelectedFaxNumber(newInputValue);
                      }}
                    />
                    <div className="d-flex justify-content-between">
                      <div className={styles.sectionTitle}>
                        Add New Recipient
                      </div>
                      <div
                        className={`${styles.openContactLink} ${
                          isSendingFax ? styles.disabledContactLink : ''
                        }`}
                      >
                        <ContactIcon className="me-2" />
                        <span onClick={() => setOpenContacts(true)}>
                          Saved Contacts
                        </span>
                      </div>
                    </div>

                    <div className={styles.addRecipientBox}>
                      <Grid container spacing={3}>
                        <Grid item sm={12} md={6}>
                          <TextInputField
                            InputProps={{
                              style: {
                                background: '#FFF',
                              },
                            }}
                            fieldName="firstName"
                            fieldLabel="FIRST NAME"
                            mt={0}
                            disabled={isSendingFax}
                          />
                        </Grid>
                        <Grid item sm={12} md={6}>
                          <TextInputField
                            InputProps={{
                              style: {
                                background: '#FFF',
                              },
                            }}
                            fieldName="lastName"
                            fieldLabel="LAST NAME"
                            mt={0}
                            disabled={isSendingFax}
                          />
                        </Grid>
                      </Grid>
                      <Grid style={{ marginTop: -15 }} container spacing={3}>
                        <Grid item sm={12} md={6}>
                          <TextInputField
                            InputProps={{
                              style: {
                                background: '#FFF',
                              },
                            }}
                            fieldName="companyName"
                            fieldLabel="COMPANY"
                            mt={0}
                            disabled={isSendingFax}
                          />
                        </Grid>
                        <Grid item sm={12} md={6}>
                          <PhoneInputField
                            InputProps={{
                              style: {
                                background: '#FFF',
                              },
                            }}
                            fieldName="faxNumber"
                            fieldLabel="FAX NUMBER"
                            mt={0}
                            disabled={isSendingFax}
                          />
                        </Grid>
                      </Grid>
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <FormControl
                        className="me-auto"
                        style={{ marginLeft: '3px' }}
                      >
                        <FormGroup>
                          <FormControlLabel
                            onChange={(e) =>
                              setFieldValue('saveContact', e.target.checked)
                            }
                            value="end"
                            checked={values.saveContact}
                            control={<Checkbox />}
                            label="Save Contact"
                            labelPlacement="end"
                            disabled={isSendingFax}
                          />
                        </FormGroup>
                      </FormControl>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<AddIcon style={{ fontSize: 14 }} />}
                        type="submit"
                        disabled={isSendingFax}
                      >
                        Add
                      </Button>
                    </div>

                    <div className="d-flex align-items-end mb-2 mt-2">
                      <div className={styles.recipientListLabel}>
                        Recipient list (maximum 50)
                      </div>
                    </div>
                    <Autocomplete
                      className="mt-2"
                      style={
                        isSubmitting || isSendingFax
                          ? { pointerEvents: 'none', cursor: 'no-drop' }
                          : {}
                      }
                      multiple
                      id="tags-input-field"
                      options={suggestions || []}
                      defaultValue={[]}
                      freeSolo={false}
                      filterSelectedOptions
                      value={recipients || []}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            key={index}
                            style={{
                              flexDirection: 'row-reverse',
                              fontSize: 'small',
                            }}
                            size="small"
                            label={option.name}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderOption={(option) => (
                        <span className="text-truncate">{option.name}</span>
                      )}
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label=""
                          placeholder={
                            loadingRecipients
                              ? 'Loading...'
                              : 'Start typing to add saved contact'
                          }
                          size="small"
                        />
                      )}
                      onChange={(event, newInputValue, reason, details) => {
                        if (reason === 'select-option') {
                          handleRecipientAdd([
                            newInputValue[newInputValue.length - 1],
                          ]);
                        } else if (reason === 'remove-option') {
                          handleRecipientDelete(details.option);
                        }
                      }}
                      disabled={isSendingFax || loadingRecipients}
                    />
                    {faxCoverLetter && coverLetterSection}
                    <div className="mt-3">
                      <div className={styles.sectionTitle}>Attachments</div>
                      <div className={styles.sectionSubTitle}>
                        {`You can add up to 10 documents, up to 10MB each (${VALID_FORMATS.map(
                          (format) => format.split('.')[1],
                        )
                          .join(', ')
                          .toUpperCase()})`}
                        .
                      </div>
                      <div className={styles.uploadContainer}>
                        <FileUpload
                          maxLimit={10}
                          onFilesChanged={setFiles}
                          accept={VALID_FORMATS.join()}
                          maxFileSize={10}
                          disabled={isSendingFax}
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-4">
                      <Button
                        className="primary-btn mr-auto"
                        variant="outlined"
                        color="primary"
                        onClick={handleClose}
                        disabled={isSendingFax}
                      >
                        Cancel
                      </Button>

                      <Button
                        className="secondary-btn"
                        variant="contained"
                        color="secondary"
                        disabled={
                          isSendingFax ||
                          recipients.length === 0 ||
                          files.length === 0
                        }
                        onClick={handleSend}
                        startIcon={
                          isSendingFax && (
                            <CircularProgress size={14} color="secondary" />
                          )
                        }
                      >
                        {isSendingFax ? 'Sending...' : 'Send Fax'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          }
          onClose={handleClose}
        />
      )}
      {showFaxSuccess === true && (
        <FaxSuccess
          onClose={() => setShowFaxSuccess(false)}
          recipients={recipients}
        />
      )}
      {openContacts && (
        <FaxContactList
          onClose={(selectedContacts) => {
            setOpenContacts(false);
            if (selectedContacts) {
              handleRecipientAdd(selectedContacts);
            }
          }}
          recipients={recipients}
        />
      )}
      {showAddCoverLetter && (
        <AddCoverLetter
          selectedFaxNumber={selectedFaxNumber}
          coverLetter={coverLetter}
          onClose={() => setShowAdCoverLetter(false)}
          onSubmit={(data) => {
            setCoverLetter(data);
            setShowAdCoverLetter(false);
          }}
        />
      )}
    </>
  );
};

export default SendFax;

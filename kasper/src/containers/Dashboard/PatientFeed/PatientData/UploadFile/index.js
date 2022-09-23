import React, { useEffect, useState, useRef } from 'react';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { Form, Formik } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import * as Yup from 'yup';

import { useStores } from 'hooks/useStores';
import SelectField from 'components/Core/Formik/SelectField';
import Modal from 'components/Core/Modal';
import ProgressBar from 'components/ProgressBar';
import TextInputField from 'components/Core/Formik/TextInputField';
import { ReactComponent as UploadComplete } from 'assets/images/audio-upload-complete.svg';
import { ReactComponent as UploadCancel } from 'assets/images/audio-upload-cancel.svg';
import { ReactComponent as CloudUpload } from 'assets/images/cloud-upload-pink.svg';
import styles from './index.module.css';

const UploadFile = ({ onClose }) => {
  const [file, setFile] = useState('');
  const [inProgressFile, setInProgressFile] = useState('');
  const [entered, setEntered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [percentageDone, setPercentageDone] = useState(0);
  const fileRef = useRef(null);
  const { patientData, notification, patientFile } = useStores();
  const invalidExtensions = ['exe', 'bat', 'dll'];

  const categories = [
    { id: 1, name: 'Profile Information' },
    { id: 2, name: 'Medical History' },
    { id: 3, name: 'Dental History' },
    { id: 4, name: 'HIPAA' },
    { id: 5, name: 'Marketing' },
    { id: 6, name: 'Other' },
  ];

  useEffect(() => {
    if (uploading) {
      let percentage = 0;
      const timer = setInterval(() => {
        percentage += 10;
        setPercentageDone(percentage);
        if (percentage === 100) {
          setFile(inProgressFile);
          setUploading(false);
        }
      }, 100);
      return () => {
        clearInterval(timer);
      };
    }
  }, [uploading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEntered(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEntered(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEntered(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const currentFileExtension = e.dataTransfer.files[0].name
      .split('.')
      [e.dataTransfer.files[0].name.split('.').length - 1].toLowerCase();

    let invalid = invalidExtensions.includes(currentFileExtension);
    if (invalid) {
      notification.showError('Executable files are not supported');
      setEntered(false);
    } else {
      setUploading(true);
      setInProgressFile(e.dataTransfer.files[0]);
    }
    if (!invalid && percentageDone === 100) {
      setUploading(false);
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileRef.current.click();
  };

  const handleLocalFileUpload = (e) => {
    const currentFileExtension = e.target.files[0].name
      .split('.')
      [e.target.files[0].name.split('.').length - 1].toLowerCase();

    let invalid = invalidExtensions.includes(currentFileExtension);
    if (invalid) {
      notification.showError('Executable files are not supported');
    } else {
      setInProgressFile(e.target.files[0]);
      setUploading(true);
      if (percentageDone === 100) {
        setFile(e.target.files[0]);
      }
    }
  };

  const handleSave = (
    fileName,
    completeFileName,
    currentFileExtension,
    categoryName,
  ) => {
    setIsSaving(true);
    let contentType = '';
    if (
      currentFileExtension === 'png' ||
      currentFileExtension === 'jpg' ||
      currentFileExtension === 'jpeg'
    ) {
      contentType = `image/${currentFileExtension}`;
    } else if (currentFileExtension === 'pdf') {
      contentType = 'application/pdf';
    } else if (currentFileExtension === 'csv') {
      contentType = 'text/csv';
    } else if (currentFileExtension === 'doc') {
      contentType = 'application/msword';
    } else if (currentFileExtension === 'docx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (currentFileExtension === 'ppt') {
      contentType = 'application/vnd.ms-powerpoint';
    } else if (currentFileExtension === 'pptx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else if (currentFileExtension === 'rar') {
      contentType = 'application/vnd.rar';
    } else if (currentFileExtension === 'txt') {
      contentType = 'text/plain';
    } else if (currentFileExtension === 'xls') {
      contentType = 'application/vnd.ms-excel';
    } else if (currentFileExtension === 'xlsx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (currentFileExtension === 'zip') {
      contentType = 'application/zip';
    } else if (currentFileExtension === '7z') {
      contentType = 'application/x-7z-compressed';
    } else {
      contentType = 'application/octet-stream';
    }
    patientFile
      .uploadPatientFile(
        patientData.selectedPatient.id,
        completeFileName,
        file,
        categoryName,
      )
      .then((response) => {
        if (response.url) {
          axios({
            method: 'PUT',
            url: response.url,
            headers: {
              'content-type': contentType,
            },
            processData: false,
            data: file,
          })
            .then(() => {
              patientFile.setPatientFileUploaded(true);
              notification.showSuccess('File was uploaded successfully');
              setTimeout(() => {
                notification.hideNotification();
                handleClose();
              }, 2500);
            })
            .catch((e) => {
              console.error(e);
              notification.showError(
                'An unexpected error occurred while attempting to save the file',
              );
              setTimeout(() => {
                notification.hideNotification();
                handleClose();
              }, 3000);
            });
        }
      })
      .catch((e) => {
        console.error(e);
        notification.showError(
          'An unexpected error occurred while attempting to save the file',
        );
        setTimeout(() => {
          notification.hideNotification();
          handleClose();
        }, 3000);
      });
  };

  const handleUploadCancel = () => {
    setFile('');
    setPercentageDone(0);
    setInProgressFile('');
    setEntered(false);
    setUploading(false);
  };

  const handleClose = () => {
    onClose();
  };

  const initialValues = {
    file_name: file ? file.name.split('.')[0] : '',
    category_name: '',
  };

  const validationSchema = Yup.object({
    file_name: Yup.string().trim().required('File name is required'),
    category_name: Yup.string().trim().required('Category is required'),
  });

  const handleSubmitForm = (e) => {
    if (e.file_name) {
      const currentFileExtension = file.name
        .split('.')
        [file.name.split('.').length - 1].toLowerCase();
      const completeFileName = e.file_name + '.' + currentFileExtension;
      handleSave(
        e.file_name,
        completeFileName,
        currentFileExtension,
        e.category_name,
      );
    }
  };

  return (
    <Modal
      size="sm"
      allowClosing={!isSaving}
      header="Upload Patient File"
      body={
        <div
          className={styles.container}
          onDrop={(e) => handleDrop(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDragEnter={(e) => handleDragEnter(e)}
          onDragLeave={(e) => handleDragLeave(e)}
        >
          {file ? (
            <div style={{ width: '100%' }}>
              <div className={styles.successfulUpload}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileUploaded}>File uploaded</span>
              </div>
              <div className={styles.progressBarCheckbox}>
                <ProgressBar value={100} />
                <UploadComplete className={styles.checkbox} />
              </div>
              {percentageDone === 100 && (
                <div className="mt-3">
                  <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmitForm}
                    validationSchema={validationSchema}
                  >
                    {({ isSubmitting }) => (
                      <Form>
                        <TextInputField
                          fieldLabel="FILE NAME"
                          fieldName="file_name"
                          type="text"
                          placeholder="Enter file name"
                          disabled={isSubmitting}
                          required
                        />
                        <SelectField
                          mt={1}
                          fieldLabel="SELECT CATEGORY"
                          fieldName="category_name"
                          options={categories.map((category) => (
                            <MenuItem key={category.id} value={category.name}>
                              {category.name}
                            </MenuItem>
                          ))}
                        />

                        <div className="d-flex justify-content-between mt-5">
                          <Button
                            className="primary-btn me-auto"
                            variant="outlined"
                            color="primary"
                            onClick={handleClose}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>

                          <Button
                            className="secondary-btn"
                            variant="contained"
                            color="secondary"
                            onClick={handleSubmitForm}
                            type="submit"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving' : 'Save'}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              )}
            </div>
          ) : uploading ? (
            <div style={{ width: '100%' }}>
              <div className={styles.successfulUpload}>
                <span className={styles.fileName}>{inProgressFile.name}</span>
                <span className={styles.fileUploaded}>
                  Uploading {percentageDone}%
                </span>
              </div>
              <div className={styles.progressBarCheckbox}>
                <ProgressBar value={percentageDone} />
                <UploadCancel
                  className={styles.cancel}
                  onClick={handleUploadCancel}
                />
              </div>
            </div>
          ) : (
            <div>
              <div
                className={
                  entered
                    ? styles.uploadContainerFilled
                    : styles.uploadContainerEmpty
                }
              >
                <CloudUpload />
                <input
                  ref={fileRef}
                  className={styles.hidden}
                  type="file"
                  onChange={handleLocalFileUpload}
                />
                <p className={styles.uploadInstructions}>
                  <span className={styles.highlight} onClick={handleClick}>
                    Add file
                  </span>{' '}
                  or drop file here
                </p>
              </div>
            </div>
          )}
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default UploadFile;

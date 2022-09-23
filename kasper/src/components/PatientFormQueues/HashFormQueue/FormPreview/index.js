import React from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import { useStores } from 'hooks/useStores';
import Button from '@material-ui/core/Button';
import { Scrollbars } from 'react-custom-scrollbars';
import { Components, Form } from '@formio/react';
import components from 'components/FormIO';
import { useQuery } from 'react-query';
import Loader from 'components/Core/Loader';

Components.setComponents(components);

const FormPreview = ({ onCloseFormPreview, formkey }) => {
  const { patientData } = useStores();

  const { data, isFetching } = useQuery(['forminformation'], () =>
    patientData.fetchFormData(formkey),
  );

  const formData = data || {};
  const formInformation =
    Object.keys(formData).length > 0 && formData.data ? formData.data : {};
  const formJson =
    Object.keys(formInformation).length > 0 && formInformation.form_json
      ? formInformation.form_json
      : {};
  const handleClose = () => {
    onCloseFormPreview();
  };

  return (
    <Modal
      size="md"
      header="Form Preview"
      body={
        <div className="d-flex flex-column justify-content-center">
          <div className={styles.subTitleText}>{formInformation?.name}</div>
          <Loader show={isFetching} message="Loading Form Preview...">
            <Scrollbars
              style={{ height: '450px' }}
              renderTrackHorizontal={(props) => <div {...props} />}
            >
              <div className={styles.formOuterContainer}>
                {' '}
                <Form
                  src={formJson}
                  onSubmit={console.log}
                  onCustomEvent={console.log}
                />
              </div>
            </Scrollbars>
          </Loader>
        </div>
      }
      footer={
        <div className={`d-flex w-100 justify-content-center ${styles.mrTop}`}>
          <Button
            className="primary-btn"
            variant="outlined"
            color="primary"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      }
      onClose={handleClose}
    ></Modal>
  );
};

export default FormPreview;

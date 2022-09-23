import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import TextInputField from 'components/Core/Formik/TextInputField';
import { isEmpty } from 'lodash';

const TOKEN_ID_REGEX = /^[a-zA-Z0-9]*$/;

// Config keys - DB keys and UI keys mapping
const CONFIG_KEYS = {
  tokenId: 'swell_integration_token_id',
};

const initialValues = { tokenId: '' };

let validationSchema = Yup.object({
  tokenId: Yup.string()
    .trim()
    .required('Please enter token id')
    .max(64, 'Must be 64 characters or less')
    .test('regex', 'Please enter valid token id', (val) =>
      TOKEN_ID_REGEX.test(val),
    ),
});

export default function TokenIdModal({ onClose }) {
  const { notification, integrations } = useStores();
  const queryClient = useQueryClient();
  const [formInitialValues, setFormInitialValues] = useState(initialValues);

  const { [CONFIG_KEYS.tokenId]: tokenId } = queryClient.getQueryData([
    'officeConfigs',
    'integrations',
  ]);

  useEffect(() => {
    setFormInitialValues({
      tokenId: tokenId,
    });
  }, [tokenId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutate token id
  const updateIntegrations = useMutation(
    (configObj) => integrations.updateConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          ['officeConfigs', 'integrations'],
          (oldData) => ({
            ...oldData,
            ...variables,
          }),
        );
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Handle submit form
  const handleSubmitForm = async (values, { setSubmitting }) => {
    const configObj = {
      [CONFIG_KEYS.tokenId]: values.tokenId,
    };
    setSubmitting(true);
    await updateIntegrations.mutateAsync(configObj);
    setSubmitting(false);
    onClose();
  };

  const handleClose = () => onClose();

  return (
    <Modal
      size="xs"
      header="Token ID"
      body={
        <div className={styles.root}>
          <Formik
            initialValues={formInitialValues}
            onSubmit={handleSubmitForm}
            validationSchema={validationSchema}
          >
            {({ isSubmitting, isValid }) => (
              <Form>
                <div className="mb-3">
                  <TextInputField
                    fieldLabel="ID"
                    fieldName="tokenId"
                    type="text"
                    placeholder="Enter token id"
                  />
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <Button
                    className="primary-btn me-auto"
                    variant="outlined"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="secondary-btn"
                    variant="contained"
                    color="secondary"
                  >
                    {isSubmitting ? 'Saving...' : `Save`}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      }
      onClose={handleClose}
    />
  );
}

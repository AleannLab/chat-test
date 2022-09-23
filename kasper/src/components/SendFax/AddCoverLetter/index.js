import { Button } from '@material-ui/core';
import TextAreaField from 'components/Core/Formik/TextAreaField';
import TextInputField from 'components/Core/Formik/TextInputField';
import Modal from 'components/Core/Modal';
import { Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import CoverLetters from './CoverLetters';
import VisibilityIcon from '@material-ui/icons/Visibility';
import CoverLetterPreview from './CoverLetterPreview';
import { useState } from 'react';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';

const validationSchema = Yup.object({
  senderName: Yup.string().max(40, 'maximum 40 characters allowed'),
  recipientName: Yup.string().max(40, 'maximum 40 characters allowed'),
  subject: Yup.string().max(55, 'maximum 55 characters allowed'),
  notes: Yup.string().max(4000, 'maximum 4000 characters allowed'),
  coverPageId: Yup.string().required('Please select a template!'),
});

const AddCoverLetter = ({
  coverLetter,
  onClose,
  onSubmit,
  selectedFaxNumber,
}) => {
  const initialValues = {
    from_did: selectedFaxNumber?.number ?? '',
    senderName: '',
    recipientName: '',
    subject: '',
    notes: '',
    coverPageId: '',
  };
  const { fax } = useStores();
  const { data: coverPages = [] } = useQuery('faxCoverLetters', () =>
    fax.getCoverLetters(),
  );

  const [showPreview, setShowPreview] = useState();
  return (
    <Modal
      size="md"
      onClose={onClose}
      header={'Add cover letter'}
      body={
        <Formik
          validationSchema={validationSchema}
          enableReinitialize
          initialValues={coverLetter ?? initialValues}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <CoverLetters
                coverLetters={coverPages}
                value={values.coverPageId}
                onChange={(uuid) => setFieldValue('coverPageId', uuid)}
              />
              <TextInputField
                placeholder={`Recipient's name`}
                fieldName="recipientName"
                fieldLabel="TO"
                maxLength={40}
                showCharCount
              />
              <TextInputField
                placeholder={`Sender's name`}
                mt={1}
                fieldName="senderName"
                fieldLabel="FROM"
                maxLength={40}
                showCharCount
              />
              <TextInputField
                placeholder={`Fax subject`}
                mt={1}
                fieldName="subject"
                fieldLabel="SUBJECT"
                maxLength={55}
                showCharCount
              />
              <TextAreaField
                showCharCount
                maxLength={4000}
                placeholder={`Additional notes`}
                mt={1}
                fieldName="notes"
                fieldLabel="NOTES"
              />

              <div className="mt-4 d-flex justify-content-between">
                <Button
                  className="mr-auto"
                  color="primary"
                  type="reset"
                  variant="outlined"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <div>
                  {values.coverPageId.length ? (
                    <Button
                      onClick={() => setShowPreview(true)}
                      variant="outlined"
                      color="secondary"
                      startIcon={<VisibilityIcon />}
                    >
                      Preview
                    </Button>
                  ) : null}
                  <Button
                    disabled={!values.coverPageId.length}
                    className="ms-2"
                    type="submit"
                    variant="contained"
                    color="secondary"
                  >
                    Save
                  </Button>
                </div>
              </div>
              {showPreview && (
                <CoverLetterPreview
                  onClose={() => setShowPreview(false)}
                  template={
                    coverPages.find(({ uuid }) => uuid === values.coverPageId)
                      .template
                  }
                  tokens={values}
                />
              )}
            </Form>
          )}
        </Formik>
      }
    />
  );
};

export default AddCoverLetter;

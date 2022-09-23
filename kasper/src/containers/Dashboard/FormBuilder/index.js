import React, { useState } from 'react';
import './Styles/index.css';
import { FormBuilder as FormIOBuilder, Components, Form } from '@formio/react';
import 'formiojs/dist/formio.builder.css';
import Button from '@material-ui/core/Button';
// import ReactJson from 'react-json-view';
import { Scrollbars } from 'react-custom-scrollbars';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import components from 'components/FormIO';
import PatientFormJSON from 'containers/Dashboard/PaperlessForms/MedicalHistoryForm/MedicalForm.json';

Components.setComponents(components);

const FormBuilder = () => {
  let formSchema;
  const [importedSchema, setImportedSchema] = useState(PatientFormJSON);
  const [importedSchemaEdit, setImportedSchemaEdit] = useState(PatientFormJSON);
  const [showNotification, setShowNotification] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(formSchema));
    // setImportedSchema(formSchema)
    // setImportedSchemaEdit(formSchema);
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowNotification(false);
  };
  // return null
  return (
    <div className="form-root d-flex">
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={showNotification}
        onClose={handleNotificationClose}
        autoHideDuration={2000}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          {' '}
          JSON Copied!
        </MuiAlert>
      </Snackbar>

      <div className="container formBuilder">
        {/* <h4 className="d-flex align-items-center justify-content-center" style={{ height: 40 }}>Form Builder</h4> */}
        <Button
          variant="outlined"
          startIcon={<FileCopyIcon />}
          onClick={handleCopyToClipboard}
        >
          Copy
        </Button>
        <Scrollbars
          style={{ height: '100%', borderRadius: '4px' }}
          renderThumbVertical={({ style, ...props }) => (
            <div
              {...props}
              style={{
                ...style,
                backgroundColor: '#BBC1CD',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
          )}
        >
          <FormIOBuilder
            style={{ height: 'auto', overflowY: 'scroll' }}
            form={importedSchema}
            onChange={(json) => {
              formSchema = json;
              console.log(json);
            }}
            options={{
              builder: {
                basic: {
                  components: {
                    toggleCustomComp: true,
                    buttonStyledRadioButton: true,
                    dialogCheckBox: true,
                    medicalConditions: true,
                    referral: true,
                  },
                },
              },
            }}
          />
        </Scrollbars>
      </div>

      <div className="container jsonViewer d-flex flex-column">
        <h4
          className="d-flex align-items-center justify-content-center"
          style={{ height: 40 }}
        >
          Form JSON
        </h4>
        <div className="flex-grow-1 pb-3 position-relative">
          <Scrollbars
            style={{ height: '100%', borderRadius: '4px' }}
            renderThumbVertical={({ style, ...props }) => (
              <div
                {...props}
                style={{
                  ...style,
                  backgroundColor: '#BBC1CD',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              />
            )}
          >
            <Button
              variant="outlined"
              startIcon={<FileCopyIcon />}
              onClick={() => {
                setImportedSchema(importedSchemaEdit);
              }}
            >
              Set
            </Button>
            <br />
            <textarea
              value={JSON.stringify(importedSchemaEdit)}
              onChange={(e) => {
                try {
                  setImportedSchemaEdit(JSON.parse(e.target.value));
                } catch (e) {
                  setImportedSchemaEdit({});
                }
              }}
            ></textarea>
            <Form
              src={importedSchemaEdit}
              onSubmit={console.log}
              onCustomEvent={console.log}
            />
          </Scrollbars>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;

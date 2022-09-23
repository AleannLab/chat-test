import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { useStores } from 'hooks/useStores';
import Modal from 'components/Core/Modal';
import Table from 'components/Core/Table';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ActionsMenu from '../ActionsMenu';
import { IconButton } from '@material-ui/core';
import styles from './index.module.css';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import debounce from 'lodash.debounce';
import { makeStyles } from '@material-ui/styles';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import FormPreview from './FormPreview';

const useStyles = makeStyles({
  eventPopover: {
    left: '30px !important',
    top: '4px !important',
  },
  IconButtonPadding: {
    '&.MuiIconButton-root': {
      padding: '0px',
    },
  },
});

const FormName = ({ name }) => {
  return (
    <div className={styles.avatarName}>
      <div className={styles.info}>
        {' '}
        <span className={styles.name}>{name} </span>
      </div>
    </div>
  );
};

const ActionsData = ({
  FormPreviewHandler,
  formkey,
  deleteFormHandler,
  isFetching,
  isLoading,
  IconButtonPadding,
}) => {
  return (
    <div className="d-flex align-item-center ">
      <span className="me-3">
        <IconButton
          className={IconButtonPadding}
          onClick={() => FormPreviewHandler(formkey)}
        >
          <VisibilityIcon style={{ color: '#9a9a9a' }} />
        </IconButton>
      </span>
      <span>
        <IconButton
          disabled={isFetching || isLoading}
          onClick={() => deleteFormHandler(formkey)}
          className={IconButtonPadding}
        >
          <DeleteIcon style={{ color: '#9a9a9a' }} />
        </IconButton>
      </span>
    </div>
  );
};

const HashFormQueue = ({
  onClose,
  particularPatientInfo,
  patientListIncompleteForms,
  searchPatient,
}) => {
  const { patientId, firstName, lastName, phone, email } =
    particularPatientInfo;
  const { patientForm, notification } = useStores();
  const tableRows = [];
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const classes = useStyles();
  const { data, isFetching } = useQuery(['formList'], () =>
    patientForm.fetchPatientForms(patientId),
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formListData = data || {};
  const queryClient = useQueryClient();
  const [searchItem, setSearchItem] = useState('');
  const [incompleteForms, setIncompleteForms] = useState([]);
  const [formPreview, setFormPreview] = useState(false);
  const [selectedFormKey, setSelectedFormKey] = useState('');
  const filteredForms = incompleteForms.filter((form) => {
    return form.name.toLowerCase().includes(searchItem.toLowerCase());
  });

  const tableColumns = [
    { id: 'patient', width: '80%', disablePadding: false, label: 'Name' },
    { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
  ];

  const FormPreviewHandler = (formkey) => {
    setSelectedFormKey(formkey);
    setFormPreview(true);
  };

  const filterUpdatedForms = (formkey) => {
    let forms = [];
    incompleteForms.forEach((item) => {
      if (item.key !== formkey) {
        forms.push(item.key);
      }
    });
    return forms;
  };

  const deleteFormMutation = useMutation(
    (forms) => patientForm.updatePatientInvitation(formListData.secret, forms),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('formList');
        notification.showSuccess(`Form was deleted successfully`);
        patientListIncompleteForms(searchPatient);
      },
      onError: (error) => {
        notification.showError(
          'An unexpected error occurred while attempting to delete the IP Address',
        );
      },
    },
  );

  const deleteFormHandler = async (formkey) => {
    const forms = await filterUpdatedForms(formkey);
    deleteFormMutation.mutateAsync(forms);
  };

  const createData = (id, name, formkey) => {
    const patient = <FormName name={name} />;
    const action = (
      <ActionsData
        FormPreviewHandler={FormPreviewHandler}
        formkey={formkey}
        deleteFormHandler={deleteFormHandler}
        isFetching={isFetching}
        isLoading={deleteFormMutation.isLoading}
        IconButtonPadding={classes.IconButtonPadding}
      />
    );
    return {
      id,
      patient,
      action,
    };
  };

  if (
    !isFetching &&
    Object.keys(formListData).length > 0 &&
    filteredForms.length > 0
  ) {
    filteredForms.forEach((formInfo, index) => {
      tableRows.push(createData(index, formInfo.name, formInfo.key));
    });
  }

  const handleClose = () => {
    onClose();
  };

  const clearFormRefresh = () => {
    patientListIncompleteForms(searchPatient);
    onClose();
  };

  const handleFormSearch = debounce(async (searchText) => {
    setSearchItem(searchText);
  }, 500);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen); //NOSONAR
  };

  const handleShareClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };
  const prepareActionList = () => {
    return [
      { label: 'Resend link via Email', value: 1 },
      { label: 'Resend link via SMS', value: 2 },
      { label: 'Copy Link', value: 3 },
      { label: 'Clear Forms', value: 4 },
    ];
  };

  useEffect(() => {
    if (
      formListData &&
      Object.keys(formListData).length > 0 &&
      formListData.incomplete_forms
    ) {
      setIncompleteForms(formListData.incomplete_forms);
    }
  }, [formListData]);

  return (
    <>
      <Modal
        header={`${firstName + ' ' + lastName}'s Form Queue`}
        size="sm"
        body={
          <div className="d-flex flex-column justify-content-center">
            <div className={styles.searchBar}>
              <SearchIcon className="me-1" />
              <InputBase
                className={styles.inputBox}
                placeholder="Search..."
                onChange={(e) => handleFormSearch(e.target.value)}
              />
            </div>
            <div className={styles.HashformTable}>
              <Table
                columns={tableColumns}
                rows={tableRows}
                isSelectable={false}
                sortBy={tableColumns[0].id}
                height={270}
                isEmpty={!isFetching && !filteredForms.length}
                enableSearchBar={false}
              />
            </div>
          </div>
        }
        footer={
          <div className={styles.modalFooterButtons}>
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Close
            </Button>

            <Button
              className={`secondary-btn`}
              disabled={!isFetching && !filteredForms.length}
              variant="contained"
              color="secondary"
              ref={anchorRef}
              onClick={handleToggle}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              endIcon={<ArrowDropDownIcon color="#FFFFFF" />}
            >
              Share
            </Button>
            {open && (
              <ActionsMenu
                menuItems={prepareActionList()}
                rowData={{
                  id: formListData.patient_id,
                  incompleteForms: formListData.incomplete_forms,
                  secret: formListData.secret,
                  phone: phone,
                  email: email,
                }}
                searchItem={searchItem}
                HashFormQueue={true}
                styleClass={classes.eventPopover}
                handleShareClose={handleShareClose}
                clearFormRefresh={clearFormRefresh}
                parentAnchorRef={anchorRef}
              />
            )}
          </div>
        }
        onClose={handleClose}
      />
      {formPreview && (
        <FormPreview
          onCloseFormPreview={() => setFormPreview(false)}
          formkey={selectedFormKey}
        />
      )}
    </>
  );
};

export default HashFormQueue;

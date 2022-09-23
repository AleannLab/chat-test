import React, { useState } from 'react';
import Modal from 'components/Core/Modal';
import { ReactComponent as InfoIcon } from 'assets/images/info-icon.svg';
import { Button, MenuItem, Typography, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { emailValidation } from 'helpers/validations';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import TextInputField from 'components/Core/Formik/TextInputField';
import SelectField from 'components/Core/Formik/SelectField';
import UserPermission from './UserPermissions';

const getAdminPermissions = (subPermissions, groupPermissions) =>
  groupPermissions.map(({ id, name }) => {
    const permission = {
      id,
      name,
      value: true,
    };
    const groupSubPermissions = subPermissions.filter(
      ({ permissions_group_id }) => permissions_group_id === id,
    );

    permission.subPermissions = groupSubPermissions.map(({ id, name }) => ({
      id,
      name,
      value: true,
    }));

    return permission;
  });

const AdminPermission = () => (
  <div className={styles.adminPermission}>
    <span>
      <InfoIcon fill="#566F9F" width="1rem" height="1rem" className="me-2" />
    </span>
    <span className={styles.permissionText}>
      Admins can view and perform all actions within Kasper, including adding
      and editing other users.
    </span>
  </div>
);

const InviteUser = () => {
  const { users, notification, permissions } = useStores();
  const history = useHistory();
  const [newUserPermissions, setNewUserPermissions] = useState(null);
  const subPermissions = permissions.subPermissions;
  const groupPermissions = permissions.groupPermissions;

  const setNewUserPermissionsHandle = (newPermissions) => {
    setNewUserPermissions(newPermissions);
  };

  const accountTypes = [
    { id: 1, name: permissions.userRoles[0].name },
    { id: 2, name: permissions.userRoles[1].name },
  ];

  const validationSchema = Yup.object({
    email: emailValidation,
    accountType: Yup.string().trim().required('Select an account Type'),
  });

  const handleSubmitForm = async (values, props) => {
    try {
      const userPermissions =
        values.accountType === accountTypes[0].name
          ? getAdminPermissions(subPermissions, groupPermissions)
          : newUserPermissions;
      await users.inviteUser({
        ...values,
        email: values.email.toLowerCase(),
        permissions: userPermissions,
      });

      props.resetForm();
      props.setFieldValue('accountType', '');
      notification.showSuccess('Invite was sent successfully');
    } catch (err) {
      if (err.message.includes('already exists')) {
        notification.showError(
          'User with the entered email address already exists',
        );
      } else {
        notification.showError(
          'An unexpected error occurred while attempting to invite the user' +
            err,
        );
      }
    } finally {
      handleClose();
    }
  };

  const initialValues = {
    email: '',
    accountType: accountTypes[0].name,
  };

  const handleClose = () => {
    history.goBack();
    users.fetchList();
  };

  if (!subPermissions || !groupPermissions) return null;
  return (
    <Modal
      size="sm"
      header="Invite User"
      body={
        <div className={styles.container}>
          <p className={styles.subtitle}>Enter email address to invite user.</p>
          <div className="d-flex flex-column justify-content-center">
            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmitForm}
              validationSchema={validationSchema}
            >
              {({ isSubmitting, values }) => (
                <Form>
                  <Grid container spacing={2} direction="row">
                    <Grid item xs={6}>
                      <TextInputField
                        mt={1}
                        variant="outlined"
                        disabled={isSubmitting}
                        fieldLabel="EMAIL"
                        fieldName="email"
                        placeholder="Enter email"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <SelectField
                        mt={1}
                        disabled={isSubmitting}
                        fieldLabel="USER TYPE"
                        fieldName="accountType"
                        options={accountTypes.map((account) => (
                          <MenuItem key={account.id} value={account.name}>
                            {account.name}
                          </MenuItem>
                        ))}
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="h4" color="textPrimary" className="my-3">
                    Permissions
                  </Typography>
                  {values.accountType === accountTypes[0].name ? (
                    <AdminPermission />
                  ) : (
                    <UserPermission
                      setNewUserPermissions={setNewUserPermissionsHandle}
                    />
                  )}

                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      className="primary-btn me-auto"
                      variant="outlined"
                      disabled={isSubmitting}
                      color="primary"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="secondary-btn"
                      variant="contained"
                      disabled={isSubmitting}
                      color="secondary"
                      style={{ width: 'auto' }}
                    >
                      {isSubmitting ? 'Sending Invite' : 'Send Invite'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      }
      onClose={handleClose}
      footer={<></>}
    />
  );
};

export default InviteUser;

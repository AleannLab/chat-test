import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import { Button, MenuItem, Typography, Grid } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Formik, Form } from 'formik';
import Switch from 'components/Core/Switch';
import Checkbox from 'components/Core/Checkbox';
import SelectField from 'components/Core/Formik/SelectField';
import { useStores } from 'hooks/useStores';
import MessageBox from 'components/Core/MessageBox';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { PERMISSION_IDS } from 'helpers/constants';

export default function UserPermissions(props) {
  const { permissions } = useStores();
  const classes = useStyles();
  const groupPermissions = permissions.groupPermissions;
  const subPermissions = permissions.subPermissions;
  const usersPermissions = permissions.usersPermissions;
  const adminPermissions = permissions.adminPermissions;
  const currentUserID = props.userId;
  const currentUserPermissions = [];

  for (let i = 0; i < usersPermissions.length; i++) {
    if (usersPermissions[i].user_id == currentUserID) {
      currentUserPermissions.push(usersPermissions[i]);
    }
  }
  const [disabledId, setDisabledId] = useState(false);
  const { mobileAppPermissionToggle } = useFlags();

  const permissionsData = [];
  groupPermissions.forEach((singlePermission, index) => {
    permissionsData.push({
      id: singlePermission.id,
      name: singlePermission.name,
      value: false,
    });
    const currentSubPermissions = subPermissions.filter(
      (object) => object.permissions_group_id == singlePermission.id,
    );
    let enabledSubPermissionsCount = 0;
    if (currentSubPermissions.length > 0) {
      permissionsData[index]['subPermissions'] = [];
      currentSubPermissions.forEach((currentSubPermission) => {
        const permissionsExists = currentUserPermissions.find(
          (object) =>
            object.permission_id == currentSubPermission.id && object.enabled,
        );
        const permissionValue =
          typeof permissionsExists != 'undefined' ? true : false;
        if (typeof permissionsExists != 'undefined')
          enabledSubPermissionsCount++;

        permissionsData[index].subPermissions.push({
          id: currentSubPermission.id,
          name: currentSubPermission.name,
          value: permissionValue,
        });
      });
    }
    if (enabledSubPermissionsCount != 0) {
      permissionsData[index].value = true;
    }
  });
  const [currentPermissions, setCurrentPermissions] = useState([]);

  useEffect(() => {
    setCurrentPermissions(
      mobileAppPermissionToggle
        ? permissionsData
        : permissionsData.filter((p) => p.id !== PERMISSION_IDS.MOBILE_APP),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePermissionChange = async (event, permissionId) => {
    const checkedStatus = event.target.checked;
    const permissionsCopy = [...currentPermissions];
    const index = permissionsCopy.findIndex(({ id }) => id === permissionId);
    permissionsCopy[index].value = checkedStatus;
    if (
      !!permissionsCopy[index].subPermissions &&
      permissionsCopy[index].subPermissions.length
    ) {
      permissionsCopy[index].subPermissions.forEach((d) => {
        d.value = checkedStatus;
      });
    }
    setCurrentPermissions([...permissionsCopy]);
  };

  const handleSubPermissionChange = async (
    event,
    permissionId,
    subPermissionId,
  ) => {
    if (event.target == null) return null;
    const permissionsCopy = [...currentPermissions];
    const index = permissionsCopy.findIndex(({ id }) => id === permissionId);

    const subIndex = permissionsCopy[index].subPermissions.findIndex(
      ({ id }) => id === subPermissionId,
    );
    permissionsCopy[index].subPermissions[subIndex].value =
      event.target.checked;

    if (
      permissionsCopy[index].name === 'Paperless Forms' &&
      permissionsCopy[index].subPermissions[0].value === false
    ) {
      permissionsCopy[index].subPermissions[1].value = false;
      setDisabledId(permissionsCopy[index].subPermissions[1].id);
    } else {
      setDisabledId(null);
    }
    if (
      permissionsCopy[index].subPermissions.length ===
      permissionsCopy[index].subPermissions.filter((s) => s.value).length
    ) {
      permissionsCopy[index].value = true;
    } else {
      permissionsCopy[index].value = false;
    }

    setCurrentPermissions([...permissionsCopy]);
  };

  const accountTypes = [
    { id: 1, name: permissions.userRoles[0].name },
    { id: 2, name: permissions.userRoles[1].name },
  ];

  if (currentPermissions.length < 1) return null;

  return (
    <div className="d-flex flex-column justify-content-center">
      <div className="d-flex align-items-center flex-column">
        <p className="m-0">
          Editing permissions for <strong>{props.userName}</strong>
        </p>
        <p>({props.userEmail})</p>
      </div>
      <Formik
        initialValues={{ accountType: props.userAccountType }}
        onSubmit={(values) => {
          if (values.accountType === accountTypes[0].name) {
            props.commitPermissionChanges(adminPermissions, values.accountType);
          } else {
            props.commitPermissionChanges(
              currentPermissions,
              values.accountType,
            );
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <Grid container spacing={2} direction="row">
              <Grid item xs={12}>
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
              <MessageBox
                messageText="Admins can view and perform all actions within Kasper, including adding
      and editing other users."
                showIcon
              />
            ) : (
              <div className={classes.root}>
                {currentPermissions.map((singlePermission) => {
                  return (
                    <Accordion key={singlePermission.id} elevation={0}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={classes.heading}>
                          <Typography>{singlePermission.name}</Typography>
                          <Switch
                            name="phoneAccess"
                            checked={singlePermission.value}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handlePermissionChange(e, singlePermission.id)
                            }
                          />
                        </div>
                      </AccordionSummary>
                      {singlePermission.subPermissions && (
                        <AccordionDetails>
                          <div className={classes.treeNodeRoot}>
                            {singlePermission.subPermissions.map(
                              (permission) => (
                                <div
                                  key={permission.id}
                                  className={classes.treeNode}
                                >
                                  <div className={classes.treeDash}></div>
                                  <div className="flex-grow-1 d-flex justify-content-between align-items-center">
                                    <Typography className="ms-3">
                                      {permission.name}
                                    </Typography>
                                    <Checkbox
                                      checked={permission.value}
                                      disabled={permission.id === disabledId}
                                      onClickFunc={(e) =>
                                        handleSubPermissionChange(
                                          e,
                                          singlePermission.id,
                                          permission.id,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </AccordionDetails>
                      )}
                    </Accordion>
                  );
                })}
              </div>
            )}
            <div className="d-flex justify-content-between mt-5">
              <Button
                className="primary-btn me-auto"
                variant="outlined"
                color="primary"
                onClick={props.closePermissionsModal}
              >
                Cancel
              </Button>

              <Button
                className="secondary-btn"
                variant="contained"
                color="secondary"
                type="submit"
              >
                Update
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionSummary: {
    flexDirection: 'row-reverse',
  },
  treeNodeRoot: {
    border: '1px solid #D2D2D2',
    borderWidth: '0px 0px 0px 1px',
  },
  treeNode: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    top: '21px',
    padding: '4px 0px',
  },
  treeDash: {
    width: '0.6rem',
    height: '100%',
    position: 'absolute',
    transform: 'translate(0px, -50%)',
    border: '1px solid #D2D2D2',
    borderWidth: '0px 0px 1px 0px',
  },
}));

const Accordion = withStyles({
  root: {
    margin: '4px 0px',
    '&.Mui-expanded': {
      margin: '4px 0px',
    },
    '&::before': {
      display: 'none',
    },
  },
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    flexDirection: 'row-reverse',
    borderRadius: '4px',
    border: '1px solid',
    borderColor: '#00000020',
    paddingLeft: '0px',
    '&.Mui-expanded': {
      minHeight: '48px',
    },
  },
  expandIcon: {
    marginRight: '0px ',
  },
  expanded: {
    borderRadius: '4px 4px 0px 0px',
  },
  content: {
    margin: '12px 0px !important',
  },
})(MuiAccordionSummary);

const AccordionDetails = withStyles({
  root: {
    backgroundColor: '#F3F5F9',
    border: '1px solid #00000020',
    borderTopWidth: '0px',
    borderRadius: '0px 0px 4px 4px',
    display: 'flex',
    flexDirection: 'column',
    padding: '0rem 1.5rem 2rem 1.5rem',
  },
})(MuiAccordionDetails);

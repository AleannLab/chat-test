import React, { useState, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Switch from 'components/Core/Switch';
import Checkbox from 'components/Core/Checkbox';
import { useStores } from 'hooks/useStores';

export default function UserPermissions(props) {
  const classes = useStyles();
  const { permissions } = useStores();
  const permissionsData = permissions.jsonPermissions;

  const [currentPermissions, setCurrentPermissions] = useState([]);

  useEffect(() => {
    setCurrentPermissions(permissionsData);
    props.setNewUserPermissions([...permissionsData]);
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
      permissionsCopy[index].subPermissions.length ===
      permissionsCopy[index].subPermissions.filter((s) => s.value).length
    ) {
      permissionsCopy[index].value = true;
    } else {
      permissionsCopy[index].value = false;
    }
    setCurrentPermissions([...permissionsCopy]);
    props.setNewUserPermissions([...permissionsCopy]);
  };

  if (currentPermissions.length < 1) return null;

  const generatePermissionsControl = (permissionsData) => {
    return (
      <div className={classes.root}>
        {permissionsData.map((singlePermission) => (
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
                  {singlePermission.subPermissions.map((permission) => (
                    <div key={permission.id} className={classes.treeNode}>
                      <div className={classes.treeDash}></div>
                      <div className="flex-grow-1 d-flex justify-content-between align-items-center">
                        <Typography className="ms-3">
                          {permission.name}
                        </Typography>
                        <Checkbox
                          checked={permission.value}
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
                  ))}
                </div>
              </AccordionDetails>
            )}
          </Accordion>
        ))}
      </div>
    );
  };
  const permissionControl = generatePermissionsControl(currentPermissions);
  return permissionControl;
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

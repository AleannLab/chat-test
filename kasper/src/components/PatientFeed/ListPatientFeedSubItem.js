import { Card, Typography } from '@material-ui/core';
import Avatar from 'components/Avatar';
import PhoneNumber from 'awesome-phonenumber';
import { makeStyles } from '@material-ui/core/styles';
import { useStores } from 'hooks/useStores';

const ListPatientFeedSubItem = ({ patient }) => {
  const { id, firstname, lastname, phone_no } = patient;
  const { patientsFeed } = useStores();
  const isSelected =
    parseInt(id) === parseInt(patientsFeed.selectedPatient?.id);

  const classes = useStyles();

  const getDisplayName = (patient) => {
    const { firstname, lastname } = patient;
    return `${firstname} ${lastname}`;
  };

  return (
    <Card
      className={`${isSelected ? classes.selectedCard : classes.card}`}
      onClick={() => {
        patientsFeed.setIsNewSMS(false);
        patientsFeed.setSelectedPatient({
          ...patient,
          displayName: getDisplayName(patient),
        });
      }}
    >
      <div className={classes.content}>
        {/* <div className={classes.treeline}>
              <div className={classes.mask}></div>
            </div> */}
        <div className={classes.dependentAvatarContainer}>
          <div className={classes.dash}></div>
          <Avatar
            id={parseInt(id)}
            firstName={firstname}
            className={classes.dependentAvatar}
            width={25}
            height={25}
            lastName={lastname}
            mobileNo={phone_no}
            customLetter="00"
          />
        </div>

        <div>
          <Typography
            variant="body1"
            className={`${
              isSelected ? classes.selectedTypography : classes.Typography
            }`}
          >
            {!!firstname || !!lastname ? (
              <>
                {!!firstname && firstname}
                &nbsp;
                {!!lastname && lastname}
              </>
            ) : (
              !!phone_no && <>{PhoneNumber(phone_no).getNumber('national')}</>
            )}
          </Typography>
        </div>
      </div>
    </Card>
  );
};

const useStyles = makeStyles((theme) => ({
  card: {
    background: theme.palette.primary[300],
    borderRadius: '0px',
    cursor: 'pointer',
    display: 'flex',
    borderLeft: '3px #243656 solid',
  },
  selectedCard: {
    background: '#02122F',
    borderRadius: '0px',
    borderBottom: '1px #293D63 solid',
    borderLeft: '3px #F4266E solid',
    display: 'flex',
  },
  content: {
    padding: '10px 15px 10px 18px',
    display: 'flex',
    alignItems: 'center',
  },
  selectedContent: {
    padding: '10px 15px 10px 12px',
  },
  Typography: {
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '13px',
    lineHeight: '16px',
    color: '#FFFFFF',
    paddingLeft: '6px',
  },
  selectedTypography: {
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '13px',
    lineHeight: '16px',
    color: '#FFFFFF',
    paddingLeft: '6px',
  },
  treeline: {
    position: 'absolute',
    width: '5px',
    height: '45px',
    left: '20px',
    marginTop: '-40px',
    backgroundColor: '#2F4067',
  },
  mask: {
    width: '5px',
    backgroundColor: '#243656f0',
    height: '43px',
    position: 'relative',
    clear: 'none',
    right: '-2px',
    borderStyle: 'solid',
    borderWidth: '2px 2px 0px 2px',
    borderColor: '#243656f0',
    top: '-1px',
  },
  dependentAvatar: {
    zIndex: '10',
  },
  dependentAvatarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&::before': {
      content: '""',
      position: 'absolute',
      display: 'inline-block',
      width: '2px',
      height: '45px',
      marginTop: '-45px',
      left: '21px',
      backgroundColor: '#2F4067',
    },
  },
  dash: {
    width: '5px',
    height: '2px',
    backgroundColor: '#2F4067',
  },
}));

export default ListPatientFeedSubItem;

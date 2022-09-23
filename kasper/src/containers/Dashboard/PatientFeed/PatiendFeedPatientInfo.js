import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import clsx from 'clsx';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import { observer } from 'mobx-react';
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment';

import { ReactComponent as ContactIcon } from 'assets/images/contact.svg';
import Call from 'assets/images/call.svg';
import Message from 'assets/images/message.svg';
import Uparrow from 'assets/images/uparrow.svg';
import Copy from 'assets/images/copy.svg';
import { useStores } from 'hooks/useStores';
import { checkSignificantLength, normalizeNumber } from 'helpers/misc';
import { useStyles } from './index';
import PatientData from './PatientData';

export const PatiendFeedPatientInfo = observer((props) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(true);
  const [showPatientData, setShowPatientData] = useState(false);
  const { patientsFeed, patientData, notification, dialer } = useStores();

  let patient = patientsFeed.selectedPatient;

  if (!patient) patient = {};

  const handleCopy = (type, value) => {
    navigator.clipboard.writeText(value);
    notification.showSuccess(
      `${type.charAt(0).toUpperCase() + type.slice(1)} was copied succesfully`,
    );
    setTimeout(() => {
      notification.hideNotification();
    }, 2500);
  };

  const handlePatientDataClick = () => {
    patientData.setSelectedPatient(
      patient.id,
      patient.firstname,
      patient.lastname,
    );
    setShowPatientData(true);
  };

  const handlePhoneClick = (phoneNumber) => {
    let phone = new PhoneNumber(normalizeNumber(phoneNumber), 'US');
    dialer.startCall(
      phone
        ? checkSignificantLength(phone, phoneNumber)
        : normalizeNumber(phoneNumber),
    );
  };

  return (
    <>
      <Card style={{ borderRadius: '0px', boxShadow: 'none' }}>
        <CardActions disableSpacing style={{ background: '#E8E8E8' }}>
          <Typography
            variant="h6"
            style={{
              fontWeight: '800',
              marginLeft: '16px',
              fontFamily: 'Playfair Display',
              fontSize: '18px',
              color: '#0D2145',
            }}
          >
            Profile Information
          </Typography>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <img src={Uparrow} alt="kasper" style={{ height: '7px' }} />
          </IconButton>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent className="ps-0">
            {
              <Grid container>
                <Grid
                  item
                  xs={6}
                  sm={6}
                  md={6}
                  lg={4}
                  style={{ marginTop: '10px' }}
                >
                  <Typography
                    style={{
                      textAlign: 'left',
                      paddingLeft: '25px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      fontFamily: 'Montserrat',
                      color: '#02122F',
                    }}
                  >
                    Phone
                  </Typography>
                </Grid>
                <Grid item xs={2} md={2} lg={1} style={{ marginTop: '10px' }}>
                  {patient.phone_no && patient.phone_no !== '' ? (
                    <img
                      src={Call}
                      alt="kasper"
                      style={{
                        height: '15px',
                        marginLeft: '10px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handlePhoneClick(patient.phone_no)}
                    />
                  ) : (
                    <span
                      className="ms-2"
                      style={{ fontSize: '1rem', fontWeight: 500 }}
                    >
                      n/a
                    </span>
                  )}
                </Grid>
                <Grid item xs={4} md={4} lg={7} style={{ marginTop: '10px' }}>
                  <Typography
                    style={{
                      textAlign: 'left',
                      fontSize: '14px',
                      fontFamily: 'Montserrat',
                      paddingLeft: '3px',
                      fontWeight: 500,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {patient.phone_no && patient.phone_no !== '' && (
                      <span>
                        {PhoneNumber(patient.phone_no).getNumber('national')}
                        <img
                          src={Copy}
                          alt="Copy"
                          style={{
                            height: '15px',
                            marginLeft: '10px',
                            marginBottom: '4px',
                            cursor: 'pointer',
                          }}
                          onClick={() =>
                            handleCopy(
                              'phone number',
                              PhoneNumber(patient.phone_no).getNumber(
                                'national',
                              ),
                            )
                          }
                        />
                      </span>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} style={{ marginTop: '10px' }}>
                  <Typography
                    style={{
                      textAlign: 'left',
                      paddingLeft: '25px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      fontFamily: 'Montserrat',
                      color: '#02122F',
                    }}
                  >
                    Email
                  </Typography>
                </Grid>
                <Grid item xs={2} md={2} lg={1} style={{ marginTop: '10px' }}>
                  {patient.email ? (
                    <img
                      src={Message}
                      alt="kasper"
                      style={{
                        height: '12px',
                        marginLeft: '10px',
                        width: '15px',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        window.location = `mailto:${patient.email}`;
                        e.preventDefault();
                      }}
                    />
                  ) : (
                    <span
                      className="ms-2"
                      style={{ fontSize: '1rem', fontWeight: 500 }}
                    >
                      n/a
                    </span>
                  )}
                </Grid>
                <Grid item xs={4} md={4} lg={7} style={{ marginTop: '10px' }}>
                  <Typography
                    style={{
                      textAlign: 'left',
                      fontSize: '14px',
                      fontFamily: 'Montserrat',
                      paddingLeft: '3px',
                      fontWeight: 500,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {patient.email}
                    {patient.email && (
                      <img
                        src={Copy}
                        alt="Copy"
                        style={{
                          height: '15px',
                          marginLeft: '10px',
                          marginBottom: '6px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleCopy('email id', patient.email)}
                      />
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} style={{ marginTop: '10px' }}>
                  <Typography
                    style={{
                      textAlign: 'left',
                      paddingLeft: '25px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      fontFamily: 'Montserrat',
                      color: '#02122F',
                    }}
                  >
                    Preferred Provider
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={6}
                  lg={8}
                  style={{ marginTop: '10px', paddingLeft: '5px' }}
                >
                  <Typography
                    style={{
                      textAlign: 'left',
                      fontSize: '14px',
                      fontFamily: 'Montserrat',
                      paddingLeft: '3px',
                      fontWeight: 500,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {patient.preffered_provider}
                    {patient.preffered_provider_suffix
                      ? `, ${patient.preffered_provider_suffix}`
                      : ``}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={6} lg={4} style={{ marginTop: '10px' }}>
                  <Typography
                    style={{
                      textAlign: 'left',
                      paddingLeft: '25px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      fontFamily: 'Montserrat',
                      color: '#02122F',
                    }}
                  >
                    Date of Birth
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={6}
                  md={6}
                  lg={8}
                  style={{ marginTop: '10px', paddingLeft: '5px' }}
                >
                  <Typography
                    style={{
                      textAlign: 'left',
                      fontSize: '14px',
                      fontFamily: 'Montserrat',
                      paddingLeft: '3px',
                      fontWeight: 500,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {patient.dob
                      ? `${moment
                          .utc(patient.dob)
                          .format('MM/DD/YYYY')} (${moment()
                          .utc()
                          .diff(patient.dob, 'years')})`
                      : 'n/a'}
                    {/* {patients.get(["-", patients.selected, "dob"])} */}
                    {/* moment().diff('1981-01-01', 'years'); */}
                  </Typography>
                </Grid>
                {/* <Grid item xs={6} md={6} lg={4} style={{ marginTop: "10px" }}>
                <Typography
                  style={{
                    textAlign: "left",
                    paddingLeft: "25px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    fontFamily: "Montserrat",
                    color: "#02122F"
                  }}
                >
                  Money Owed
                </Typography>
              </Grid>
              <Grid item xs={6} md={6} lg={8} style={{ marginTop: "10px", paddingLeft: '5px' }}>
                <Typography
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                    fontFamily: "Montserrat",
                    paddingLeft: "3px",
                    fontWeight: 500,
                    overflowWrap: "anywhere"
                  }}
                >
                  {patient.money_owed ? patient.money_owed : "n/a"}
                </Typography>
              </Grid> 
              <Grid item xs={2} md={2} lg={2} style={{ marginTop: "10px" }}>
                {
                  patient.money_owed &&
                  <Link
                    style={{
                      textAlign: "center",
                      color: "#F4266E",
                      fontSize: "14px",
                      fontFamily: "Montserrat",
                    }}
                  >
                    view
                </Link>
                }
              </Grid>*/}
              </Grid>
            }
            <Grid container style={{ paddingLeft: '25px', marginTop: '17px' }}>
              {patient.displayName && (
                <Grid item xs={11}>
                  <Button
                    size="medium"
                    fullWidth
                    startIcon={<ContactIcon />}
                    variant="outlined"
                    color="secondary"
                    onClick={handlePatientDataClick}
                  >
                    Patient Data
                  </Button>
                </Grid>
              )}
              <Grid item xs={1} />
            </Grid>
          </CardContent>
        </Collapse>
      </Card>

      {showPatientData === true && (
        <PatientData onClose={() => setShowPatientData(false)} />
      )}
    </>
  );
});

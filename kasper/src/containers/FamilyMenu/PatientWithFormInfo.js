import React from 'react';
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ReactComponent as PhoneIcon } from 'assets/images/phone.svg';
import { ReactComponent as FormIcon } from 'assets/images/doc.svg';
import styles from './PatientWithFormInfo.module.css';
import AvatarCard from './AvatarCard';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import PhoneNumber from 'awesome-phonenumber';
import moment from 'moment';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import Skeleton from './Skeleton';

export default function PatientWithFromInfo({ phoneUID }) {
  const { patientForm, notification } = useStores();

  // React query to fetch patient ids
  const { data, isSuccess, isLoading } = useQuery(
    'patientInfo',
    () => patientForm.getFamilyInvitationData(phoneUID),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  return isLoading ? (
    <Skeleton />
  ) : isSuccess ? (
    data.map((data) => (
      <Grid key={data.id} className={styles.container}>
        <Grid
          container
          justify="space-between"
          className={styles.patientDetails}
        >
          <Grid item xs={12} sm={6}>
            <AvatarCard
              id={data.id}
              firstName={data.firstname}
              lastName={data.lastname}
              textInfo={
                data.dob
                  ? `${moment.utc(data.dob).format('L')} (${moment().diff(
                      data.dob,
                      'years',
                    )})`
                  : '-'
              }
            />
          </Grid>
          <Grid item xs={12} sm={3} className="d-flex align-items-center">
            {data.phone_no ? (
              <>
                <PhoneIcon width="1rem" height="1rem" />
                <span className={styles.contactDetails}>
                  {PhoneNumber(data.phone_no).getNumber('national')}
                </span>
              </>
            ) : null}
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            className="d-flex justify-content-end align-items-center"
          >
            {data.invite_link ? (
              <a
                href={data.invite_link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.anchorBtn}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {}}
                >
                  Start
                </Button>
              </a>
            ) : null}
          </Grid>
        </Grid>

        <Accordion
          className={styles.formsAccordion}
          disabled={!data.incomplete_forms.length}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            classes={{ expandIcon: styles.expandIcon }}
          >
            <div className={styles.accordionSummary}>
              {data.incomplete_forms.length ? (
                <>
                  This patient has{' '}
                  {data.incomplete_forms.length !== 1
                    ? `${data.incomplete_forms.length} forms`
                    : `${data.incomplete_forms.length} form`}{' '}
                  to fill{' '}
                </>
              ) : (
                <div className="d-flex align-items-center">
                  <CheckCircleIcon
                    style={{ fill: '#1ABA17', fontSize: '1.28rem' }}
                  />
                  <span style={{ color: '#1ABA17', marginLeft: '0.5rem' }}>
                    No forms remaining
                  </span>
                </div>
              )}
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} justify="space-between">
              {data.incomplete_forms.map((form) => (
                <Grid
                  item
                  sm={6}
                  xs={12}
                  key={form.key}
                  className="d-flex align-items-center"
                >
                  <FormIcon />
                  <div className="col">{form.name}</div>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
    ))
  ) : null;
}

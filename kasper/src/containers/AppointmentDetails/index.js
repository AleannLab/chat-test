import React, { useState } from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { Avatar, Divider, withStyles } from '@material-ui/core';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';

import styles from './index.module.css';
import { ReactComponent as CardLogo } from '../../assets/images/powered-by-kasper-color.svg';
import { ReactComponent as GiftIcon } from '../../assets/images/gift-with-background.svg';
import { ReactComponent as BottomIcon } from '../../assets/images/bottom-icon.svg';
import { useStores } from '../../hooks/useStores';
import { birthdayCheck } from 'helpers/birthdayCheck';
import LinkExpired from 'containers/LinkExpired';
import { PreViewAppointmentDetails } from './PreViewAppointmentDetails';
import Notification from '../../components/Notification';
import Fallback from '../../components/Fallback';

const ArrowRightRoundedIconRed = withStyles(() => ({
  root: {
    color: '#F4266E',
    fontSize: 24,
  },
}))(ArrowRightRoundedIcon);

const AppointmentDetails = () => {
  const [linkExpired, setLinkExpired] = useState(false);
  const params = useParams();
  const { scheduling: schedulingStore, notification } = useStores();

  const appointmentData = useQuery(
    'getAppointmentPublic',
    () => schedulingStore.getAppointmentPublic(params.appointmentId),
    {
      onSuccess: (response) => {
        if (response.expired) {
          setLinkExpired(true);
        }
        return response;
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  if (linkExpired) {
    return <LinkExpired />;
  }

  if (appointmentData.isError) {
    return <Fallback />;
  }

  if (appointmentData.isLoading) {
    return (
      <div className={styles.container}>
        <Notification />
        <PreViewAppointmentDetails />
        <Divider />
      </div>
    );
  }

  const { appointment, patient, allergies, diseases } = appointmentData.data;
  const procedures = appointment?.description?.split(',') || [];

  return (
    <div className={styles.container}>
      <Notification />
      <div className={styles.card}>
        <div className={styles.card_title}>
          <h1 className={styles.title}>Appointment Details</h1>
        </div>

        <div className={styles.desktop}>
          <div className={styles.card_name_photo_block_wrapper}>
            <div className={styles.card_name_photo_block}>
              <Avatar
                className={styles.card_photo}
                id={patient.id}
                firstName={patient.firstname || patient.firstName}
                lastName={patient.lastname || patient.lastName}
                customLetter="00"
                width={58}
                height={58}
                letterFontSize={16}
              />
              <span className={styles.card_name_info_block_name}>
                {appointment.patient}
              </span>
              <span className={styles.card_name_info_block_gray_text}>
                {patient.gender && patient.yearsOld
                  ? `${patient.gender}, ${patient.yearsOld}`
                  : patient.gender || patient.yearsOld}
              </span>
              <span className={styles.card_name_info_block_up_text}>
                {patient?.dob &&
                  `Birthday on ${moment.utc(patient.dob).format('LL')}`}
              </span>
            </div>

            <BottomIcon className={styles.card_name_photo_block_bottom_icon} />
          </div>

          <div className={styles.card_name_info_block}>
            {patient?.dob && birthdayCheck(patient?.dob) && (
              <>
                <div className={styles.card_photo_banner}>
                  <GiftIcon />
                </div>
                <span className={styles.card_name_info_block_birthday}>
                  {birthdayCheck(patient?.dob)}
                </span>
              </>
            )}
            <span className={styles.card_name_info_block_date}>
              {appointment.startDate}
            </span>
            <span className={styles.card_name_info_block_time}>
              {appointment.startTime} – {appointment.endTime}
            </span>
            <section className={styles.card_name_info_block_text}>
              <span className={styles.card_name_info_block_text_gray}>
                {procedures.length > 1 ? 'Procedures' : 'Procedure'}
              </span>
              {procedures.length ? (
                <span className={styles.card_name_info_block_text_procedures}>
                  {procedures.join(', ')}
                </span>
              ) : (
                <span className={styles.card_name_info_block_text_procedures}>
                  <span className={styles.card_name_info_block_no_allergic}>
                    No Procedures
                  </span>
                </span>
              )}
              <span className={styles.card_name_info_block_text_gray}>
                Medical conditions
              </span>
              <ul className={styles.card_name_info_block_text_ul}>
                {diseases.length > 0 ? (
                  diseases.map((item) => (
                    <li
                      key={item.name}
                      className={styles.card_name_info_block_text_li}
                    >
                      <div className={styles.card_name_info_block_text_li_dot}>
                        <ArrowRightRoundedIconRed />
                      </div>
                      {item.name}
                    </li>
                  ))
                ) : (
                  <span className={styles.card_name_info_block_no_allergic}>
                    No medical conditions
                  </span>
                )}
              </ul>
              <span className={styles.card_name_info_block_text_gray}>
                Allergies list
              </span>
              {allergies?.length > 0 ? (
                <ul className={styles.card_name_info_block_text_ul}>
                  {allergies.map((allergy, index) => (
                    <li
                      key={index}
                      className={styles.card_name_info_block_text_li}
                    >
                      <div className={styles.card_name_info_block_text_li_dot}>
                        <ArrowRightRoundedIconRed />
                      </div>
                      {allergy.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className={styles.card_name_info_block_text_ul}>
                  <span className={styles.card_name_info_block_no_allergic}>
                    No allergies
                  </span>
                </ul>
              )}
              <span className={styles.card_name_info_block_text_gray}>
                Appointment Notes
              </span>
              {appointment.note ? (
                <span className={styles.card_name_info_block_text_notes}>
                  {appointment.note}
                </span>
              ) : (
                <span className={styles.card_name_info_block_no_allergic}>
                  No appointment Notes
                </span>
              )}
            </section>
          </div>
        </div>

        <div className={styles.card_logo}>
          <CardLogo />
        </div>
      </div>
    </div>
  );
};

export default observer(AppointmentDetails);

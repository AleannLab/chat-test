import React from 'react';
import styles from './index.module.css';
import { ReactComponent as CardLogo } from '../../assets/images/powered-by-kasper-color.svg';
import { Avatar } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

export const PreViewAppointmentDetails = () => (
  <div className={styles.card}>
    <div className={styles.card_title}>
      <h1 className={styles.title}>Appointment Details</h1>
    </div>
    <div className={styles.desktop}>
      <div className={styles.card_name_photo_block}>
        <Avatar
          className={styles.card_photo}
          firstName={'A'}
          lastName={'A'}
          customLetter="00"
          width={58}
          height={58}
          letterFontSize={16}
        />
        <span className={styles.card_name_info_block_name}>
          <div className={styles.card_info_name}>
            <Skeleton variant="rect" animation="wave" width="80%" height={15} />
          </div>
        </span>
        <span className={styles.card_name_info_block_gray_text}>
          <div className={styles.card_info_name}>
            <Skeleton variant="rect" animation="wave" width="20%" height={15} />
          </div>{' '}
        </span>
        <span className={styles.card_name_info_block_up_text}>
          <div className={styles.card_info_name}>
            <Skeleton
              variant="rect"
              animation="wave"
              width="100%"
              height={15}
            />
          </div>{' '}
        </span>
        <div className={styles.card_name_photo_block_text}></div>
      </div>

      <div className={styles.card_name_info_block}>
        <span className={styles.card_name_info_block_date}>
          <Skeleton variant="rect" animation="wave" width="200px" height={25} />
        </span>
        <span className={styles.card_name_info_block_time}>
          <Skeleton variant="rect" animation="wave" width="200px" height={25} />
        </span>
        <section className={styles.card_name_info_block_text}>
          <span className={styles.card_name_info_block_text_gray}>
            Preferred Provider
          </span>
          <span className={styles.card_name_info_block_text_procedures}>
            <Skeleton variant="rect" animation="wave" width="70%" height={15} />
          </span>
          <span className={styles.card_name_info_block_text_gray}>
            Medical conditions
          </span>
          <ul className={styles.card_name_info_block_text_ul}>
            <li className={styles.card_name_info_block_text_li}>
              <Skeleton
                variant="rect"
                animation="wave"
                width="70%"
                height={15}
              />
            </li>
            <li className={styles.card_name_info_block_text_li}>
              <Skeleton
                variant="rect"
                animation="wave"
                width="70%"
                height={15}
              />
            </li>
          </ul>
          <span className={styles.card_name_info_block_text_gray}>
            Allergies list
          </span>
          <ul className={styles.card_name_info_block_text_ul}>
            <li className={styles.card_name_info_block_text_li}>
              <Skeleton
                variant="rect"
                animation="wave"
                width="70%"
                height={15}
              />
            </li>
          </ul>
          <span className={styles.card_name_info_block_text_gray}>
            Appointment Notes
          </span>

          <span className={styles.card_name_info_block_text_notes}>
            <Skeleton variant="rect" animation="wave" width="70%" height={15} />
          </span>
        </section>
      </div>
    </div>

    <div className={styles.card_logo}>
      <CardLogo />
    </div>
  </div>
);
